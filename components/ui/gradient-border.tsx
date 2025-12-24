import * as React from "react";
import { cn } from "@/lib/utils";

export interface GradientBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variant of the gradient border
   * @default "accent"
   */
  variant?: "accent" | "primary" | "custom";
  /**
   * Border width in pixels
   * @default 2
   */
  borderWidth?: number;
  /**
   * Border radius
   * @default "rounded-xl"
   */
  borderRadius?: string;
  /**
   * Custom gradient colors (only used when variant is "custom")
   * Format: CSS gradient string or array of colors
   */
  gradient?: string | string[];
  /**
   * Whether to animate the gradient
   * @default false
   */
  animated?: boolean;
  /**
   * Background color for the inner content
   */
  innerBg?: string;
}

/**
 * GradientBorder - A component that wraps content with a gradient border
 * 
 * @example
 * ```tsx
 * <GradientBorder variant="accent" borderWidth={2}>
 *   <div className="p-4">Content here</div>
 * </GradientBorder>
 * ```
 */
export const GradientBorder = React.forwardRef<HTMLDivElement, GradientBorderProps>(
  (
    {
      className,
      children,
      variant = "accent",
      borderWidth = 2,
      borderRadius = "rounded-xl",
      gradient,
      animated = false,
      innerBg,
      ...props
    },
    ref
  ) => {
    // Define gradient colors based on variant
    const getGradientColors = () => {
      if (variant === "custom" && gradient) {
        if (Array.isArray(gradient)) {
          return gradient.join(", ");
        }
        return gradient;
      }

      switch (variant) {
        case "accent":
          return "oklch(0.9100 0.2300 128), oklch(0.8500 0.2000 140), oklch(0.9100 0.2300 128)";
        case "primary":
          return "oklch(0.2000 0 0), oklch(0.4000 0 0), oklch(0.2000 0 0)";
        default:
          return "oklch(0.9100 0.2300 128), oklch(0.8500 0.2000 140), oklch(0.9100 0.2300 128)";
      }
    };

    const gradientColors = getGradientColors();

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          borderRadius,
          animated && "animate-gradient-shift",
          className
        )}
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(135deg, ${gradientColors})`,
          backgroundSize: animated ? "200% 200%" : "100% 100%",
        }}
        {...props}
      >
        <div
          className={cn(
            "w-full h-full",
            borderRadius,
            innerBg || "bg-background"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
GradientBorder.displayName = "GradientBorder";

/**
 * SimpleGradientBorder - A simpler API using Tailwind gradient classes
 */
export interface SimpleGradientBorderProps
  extends Omit<GradientBorderProps, "variant" | "gradient"> {
  /**
   * Gradient colors as Tailwind classes (e.g., "from-blue-500 via-purple-500 to-pink-500")
   */
  colors?: string;
}

export const SimpleGradientBorder = React.forwardRef<
  HTMLDivElement,
  SimpleGradientBorderProps
>(
  (
    {
      className,
      children,
      colors = "from-[oklch(0.9100_0.2300_128)] via-[oklch(0.8500_0.2000_140)] to-[oklch(0.9100_0.2300_128)]",
      borderWidth = 2,
      borderRadius = "rounded-xl",
      animated = false,
      innerBg,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-gradient-to-br",
          colors,
          borderRadius,
          animated && "animate-gradient-shift",
          className
        )}
        style={{
          padding: `${borderWidth}px`,
        }}
        {...props}
      >
        <div
          className={cn(
            "w-full h-full",
            borderRadius,
            innerBg || "bg-background"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
SimpleGradientBorder.displayName = "SimpleGradientBorder";
