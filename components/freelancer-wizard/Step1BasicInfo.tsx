'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { X, Upload, Loader2, User } from 'lucide-react';
import type { WizardData } from './FreelancerWizard';
import { ArrowUpLeft02Icon, ArrowUpRight02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
// import { Separator } from '../ui/separator';

interface Step1BasicInfoProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
}

const COMMON_LANGUAGES = ['Dutch', 'English', 'German', 'French', 'Spanish', 'Turkish', 'Arabic', 'Polish'];

type SubStep = 'basic' | 'languages';

export function Step1BasicInfo({ data, onUpdate, onNext }: Step1BasicInfoProps) {
  const [fullName, setFullName] = useState(data.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '');
  const [languages, setLanguages] = useState<string[]>(data.languages || []);
  const [customLanguage, setCustomLanguage] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>(data.profilePhoto || '');
  const [photoPreview, setPhotoPreview] = useState<string>(data.profilePhoto || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive step state - initialize based on existing data
  const getInitialSubStep = (): SubStep => {
    if (!data.fullName || !data.phoneNumber) return 'basic';
    return 'languages';
  };

  const [currentSubStep, setCurrentSubStep] = useState<SubStep>(getInitialSubStep());
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync profile photo when data changes (e.g., when returning to the page)
  useEffect(() => {
    if (data.profilePhoto) {
      setProfilePhoto(data.profilePhoto);
      setPhotoPreview(data.profilePhoto);
    }
  }, [data.profilePhoto]);

  const handleAddLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      const newLanguages = [...languages, language];
      setLanguages(newLanguages);
      onUpdate({ languages: newLanguages });
      setCustomLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    const newLanguages = languages.filter((l) => l !== language);
    setLanguages(newLanguages);
    onUpdate({ languages: newLanguages });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await response.json();
      setProfilePhoto(url);
      onUpdate({ profilePhoto: url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPhotoPreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
    setPhotoPreview('');
    onUpdate({ profilePhoto: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle progression to next sub-step
  const handleContinueToNext = () => {
    if (currentSubStep === 'basic') {
      if (fullName.trim().length === 0 || phoneNumber.trim().length === 0) return;
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('languages');
        setIsAnimating(false);
      }, 400); // Match animation duration
    }
  };

  // Handle going back to previous sub-step
  const handleBackToPrevious = () => {
    if (currentSubStep === 'languages') {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSubStep('basic');
        setIsAnimating(false);
      }, 400);
    }
  };

  const handleNext = () => {
    onUpdate({
      fullName,
      phoneNumber,
      languages,
      profilePhoto,
    });
    onNext();
  };

  const isValid = fullName.trim().length > 0 && phoneNumber.trim().length > 0;

  return (
    <div className="flex flex-col gap-6 lg:px-4 w-full">
      <div className="relative ">
        {/* Basic Info Section (Photo, Name, Phone) */}
        {currentSubStep === 'basic' && (
          <div className={`flex flex-col gap-6 ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
            <div className="flex flex-col gap-4">
              {/* Profile Photo Upload */}
              <div className="flex flex-col gap-2">
                {/* <label className="text-primary text-lg md:text-lg text-center lg:text-left">Profile Photo</label> */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="profile-photo-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="profile-photo-upload" className="cursor-pointer">
                      {photoPreview ? (
                        <div className="relative group">
                          <Image
                            src={photoPreview}
                            alt="Profile preview"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full object-cover border-2 border-accent transition-opacity group-hover:opacity-80"
                            unoptimized={photoPreview.startsWith('data:')}
                          />
                          {!isUploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemovePhoto();
                              }}
                              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-secondary-foreground text-primary flex items-center justify-center hover:bg-secondary-foreground/90 z-10"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                          {!isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary-foreground border-2 border-accent flex items-center justify-center hover:border-accent/80 transition-colors cursor-pointer group">
                          <User className="w-12 h-12 text-primary/50 group-hover:text-primary/70 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-6 w-6 text-primary/70" />
                          </div>
                        </div>
                      )}
                    </label>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full pointer-events-none">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  {/* <p className="text-xs text-secondary-foreground text-center">
              Click to upload. JPG, PNG or GIF. Max 5MB
            </p> */}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {/* <Label htmlFor="fullName">
            Full Name <span className="text-destructive">*</span>
          </Label> */}
                  <Input
                    id="fullName"
                    value={fullName}
                    className="bg-primary-foreground h-15 pl-8 text-2xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {/* <Label htmlFor="phoneNumber">
            Phone Number <span className="text-destructive">*</span>
          </Label> */}
                  <Input
                    id="phoneNumber"
                    type="tel"
                    className="bg-primary-foreground h-15 pl-8 text-2xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+31 6 12345678"
                    required
                  />
                  <p className="text-xs text-secondary-foreground pl-4">
                    Clients won&apos;t see your phone; we use it for confirmations.
                  </p>
                </div>
              </div>
            </div>

            {/* Continue button for basic info */}
            {fullName.trim().length > 0 && phoneNumber.trim().length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleContinueToNext}
                  className="bg-secondary-foreground border border-primary rounded-full text-secondary w-14 h-14 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground rotate-45"
                >
                  <HugeiconsIcon icon={ArrowUpRight02Icon} size={24} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Languages Section */}
        {currentSubStep === 'languages' && (
          <div className={`flex flex-col gap-6 ${isAnimating ? 'fade-out-up' : 'fade-in-from-bottom'}`}>
            {/* Back button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToPrevious}
              className="bg-secondary-foreground border border-primary rounded-full text-secondary w-10 h-10 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground mb-2 rotate-[-45deg]"
            >
              <HugeiconsIcon icon={ArrowUpLeft02Icon} size={24} />
            </Button>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-6 items-center mb-4">
                {/* <Label htmlFor="languages" className="text-primary">Languages Spoken</Label> */}
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="flex items-center rounded-full gap-1 bg-primary text-secondary-foreground">
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="ml-1 hover:text-destructive text-secondary-foreground/50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              {/* <Separator className="bg-accent h-1 w-full mt-4" /> */}

              <span className="text-secondary-foreground text-sm md:text-sm">+ Add another language</span>

              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_LANGUAGES.filter((lang) => !languages.includes(lang)).map((lang) => (
                  <Button
                    key={lang}
                    type="button"
                    variant="outline"
                    className="bg-primary-foreground h-10 text-sm md:text-sm border border-primary rounded-full text-secondary-foreground placeholder:text-secondary-foreground hover:bg-primary hover:text-secondary-foreground hover:border-primary"
                    size="sm"
                    onClick={() => handleAddLanguage(lang)}
                  >
                    + {lang}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row gap-2">
                <Input
                  id="customLanguage"
                  className="bg-primary-foreground h-15 pl-8 text-2xl md:text-5xl border border-accent focus:border-accent focus-visible:border-accent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none focus:shadow-none focus-visible:shadow-none rounded-full text-secondary-foreground placeholder:text-secondary-foreground/50"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customLanguage.trim()) {
                      e.preventDefault();
                      handleAddLanguage(customLanguage.trim());
                    }
                  }}
                  placeholder="Add another language..."
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-secondary-foreground border border-primary rounded-full text-secondary w-full lg:w-36 h-15 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground text-2xl"
                  onClick={() => {
                    if (customLanguage.trim()) {
                      handleAddLanguage(customLanguage.trim());
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-end gap-4 mt-8">
        {currentSubStep === 'languages' && (
          <Button onClick={handleNext} disabled={!isValid} className="bg-secondary-foreground border border-primary rounded-full text-secondary h-12 hover:bg-primary hover:text-secondary-foreground hover:border-secondary-foreground">
            Next: What can you help with?
          </Button>
        )}
      </div>
    </div>
  );
}


