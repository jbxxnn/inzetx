import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/app/actions/profile';
import { getJobRequest } from '@/app/actions/job';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface DebugPageProps {
  params: Promise<{ id: string }>;
}

async function DebugContainer({ id }: { id: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'client') {
    redirect('/dashboard');
  }

  // Get job request
  const job = await getJobRequest(id);

  if (!job) {
    return <div>Job not found</div>;
  }

  // Check freelancer profiles
  const { data: freelancers, error: freelancersError } = await supabaseAdmin
    .from('freelancer_profiles')
    .select('id, profile_id, description, embedding, headline')
    .limit(10);

  // Check if job has embedding
  const jobHasEmbedding = !!job.embedding;

  // Try to call RPC directly with different thresholds
  let rpcResult: any = null;
  let rpcError: any = null;
  let rpcResultLow: any = null; // With even lower threshold

  if (job.embedding) {
    try {
      // Test with the same threshold as the actual matching function (0.2)
      const { data, error } = await supabaseAdmin.rpc('match_freelancers', {
        query_embedding: job.embedding,
        match_threshold: 0.2, // Same as findMatchesForJobRequest uses
        match_count: 10,
      });
      rpcResult = data;
      rpcError = error;

      // Also test with very low threshold to see if any matches exist
      if (!data || data.length === 0) {
        const { data: dataLow } = await supabaseAdmin.rpc('match_freelancers', {
          query_embedding: job.embedding,
          match_threshold: 0.1, // Very low threshold (10% similarity)
          match_count: 10,
        });
        rpcResultLow = dataLow;
      }
    } catch (err) {
      rpcError = err;
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-8">
      <h1 className="text-3xl font-bold">Debug: Matching Diagnostics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Job Request Info</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Job ID:</strong> {job.id}
            </p>
            <p>
              <strong>Has Embedding:</strong>{' '}
              {jobHasEmbedding ? '✅ Yes' : '❌ No'}
            </p>
            <p>
              <strong>Description:</strong> {job.description.substring(0, 100)}...
            </p>
            <p>
              <strong>Embedding Type:</strong>{' '}
              {job.embedding ? typeof job.embedding : 'N/A'}
            </p>
            {job.embedding && (
              <p>
                <strong>Embedding Length:</strong>{' '}
                {Array.isArray(job.embedding)
                  ? job.embedding.length
                  : 'Not an array'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Freelancer Profiles</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Total Freelancers:</strong>{' '}
              {freelancers?.length || 0}
            </p>
            {freelancersError && (
              <p className="text-red-500">
                <strong>Error:</strong> {freelancersError.message}
              </p>
            )}
            {freelancers && (
              <div className="mt-4 space-y-2">
                {freelancers.map((fp) => (
                  <div key={fp.id} className="border p-2 rounded text-xs">
                    <p>
                      <strong>ID:</strong> {fp.id.substring(0, 8)}...
                    </p>
                    <p>
                      <strong>Has Embedding:</strong>{' '}
                      {fp.embedding ? '✅' : '❌'}
                    </p>
                    <p>
                      <strong>Description:</strong>{' '}
                      {fp.description?.substring(0, 50)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">RPC Function Test</h2>
          <div className="space-y-2 text-sm">
            {!job.embedding ? (
              <p className="text-red-500">
                ❌ Cannot test RPC: Job has no embedding
              </p>
            ) : rpcError ? (
              <div>
                <p className="text-red-500">
                  <strong>RPC Error:</strong> {JSON.stringify(rpcError, null, 2)}
                </p>
              </div>
            ) : (
              <div>
                <p>
                  <strong>Matches Found:</strong> {rpcResult?.length || 0}
                </p>
                {rpcResult && rpcResult.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {rpcResult.map((match: any, idx: number) => (
                      <div key={idx} className="border p-3 rounded">
                        <p>
                          <strong>Similarity:</strong> {match.similarity?.toFixed(3)}
                        </p>
                        <p>
                          <strong>Headline:</strong> {match.headline || 'N/A'}
                        </p>
                        <p>
                          <strong>Description:</strong>{' '}
                          {match.description?.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {rpcResult && rpcResult.length === 0 && (
                  <div className="text-yellow-500 mt-2 space-y-2">
                    <p>
                      ⚠️ No matches found with threshold 0.2 (same as matching function).
                    </p>
                    {rpcResultLow && rpcResultLow.length > 0 && (
                      <div className="bg-yellow-500/10 p-3 rounded mt-2">
                        <p className="font-semibold">
                          ✅ But matches found with threshold 0.1:
                        </p>
                        <p className="text-xs mt-1">
                          This suggests the threshold 0.2 might be too high, or
                          the actual matching function is using a different threshold.
                        </p>
                        <div className="mt-2 space-y-1">
                          {rpcResultLow.slice(0, 3).map((match: any, idx: number) => (
                            <div key={idx} className="text-xs border p-2 rounded">
                              Similarity: {match.similarity?.toFixed(3)} |{' '}
                              {match.headline || 'No headline'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {rpcResultLow && rpcResultLow.length === 0 && (
                      <p className="text-xs">
                        Also no matches with threshold 0.1. Check if embeddings
                        are in correct format or if descriptions are too different.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          {!jobHasEmbedding && (
            <li className="text-red-500">
              ❌ Job has no embedding. Re-create the job or manually generate
              embedding.
            </li>
          )}
          {freelancers && freelancers.length === 0 && (
            <li className="text-red-500">
              ❌ No freelancer profiles exist. Create at least one freelancer
              profile first.
            </li>
          )}
          {freelancers &&
            freelancers.some((fp) => !fp.embedding) && (
              <li className="text-yellow-500">
                ⚠️ Some freelancer profiles don't have embeddings. They need to
                save their profile to generate embeddings.
              </li>
            )}
          {jobHasEmbedding &&
            freelancers &&
            freelancers.length > 0 &&
            rpcResult &&
            rpcResult.length === 0 && (
              <li className="text-yellow-500">
                ⚠️ No matches found. The similarity threshold might be too high,
                or the job description doesn't match any freelancer descriptions.
                Try:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Lowering the threshold in the matching function</li>
                  <li>Making job description more similar to freelancer
                    descriptions</li>
                  <li>Checking if embeddings are the correct format</li>
                </ul>
              </li>
            )}
        </ul>
      </div>
    </div>
  );
}

// Wrapper to unwrap params inside Suspense
async function DebugMatchesWrapper({ params }: DebugPageProps) {
  const { id } = await params;
  return <DebugContainer id={id} />;
}

export default function DebugMatchesPage({ params }: DebugPageProps) {
  return (
    <Suspense fallback={<div>Loading debug info...</div>}>
      <DebugMatchesWrapper params={params} />
    </Suspense>
  );
}

