import { useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import {
  ARRAY_INPUT_VARIANT_LABELS,
  type ArrayInputVariant,
  generateArrayVariant,
} from '@/algorithms/shared/arrayVariants';
import { parseCustomArrayInput } from '@/algorithms/shared/parseCustomArrayInput';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

const VARIANTS = Object.keys(ARRAY_INPUT_VARIANT_LABELS) as ArrayInputVariant[];

interface ArrayInputControlsProps {
  /** Current array size, used when generating a variant (custom
   *  input ignores this — its own length determines the array). */
  size: number;
  onApply: (values: number[]) => void;
}

/**
 * Lets the user pick a named input shape (random, nearly sorted,
 * reverse sorted, few unique, duplicate heavy, sorted) or type a
 * custom comma-separated array. Only array-visualization algorithms
 * render this — AlgorithmDetailPage decides that, this component
 * has no opinion about which algorithm is loaded.
 *
 * `onApply` is only ever called with a fully valid `number[]` —
 * invalid custom input shows an inline error and never calls back,
 * so the caller (AlgorithmDetailPage) never needs its own
 * validation layer on top of this one.
 */
export function ArrayInputControls({ size, onApply }: ArrayInputControlsProps) {
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  function handleVariantSelect(variant: ArrayInputVariant) {
    onApply(generateArrayVariant(variant, size));
  }

  function handleCustomSubmit() {
    const result = parseCustomArrayInput(customValue);
    if (result.error || !result.values) {
      setCustomError(result.error);
      return;
    }
    setCustomError(null);
    onApply(result.values);
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5" />
          Input shape:
        </span>
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            variant="outline"
            size="sm"
            onClick={() => handleVariantSelect(variant)}
            className="h-7 px-2.5 text-xs"
          >
            {ARRAY_INPUT_VARIANT_LABELS[variant]}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => {
              setCustomValue(e.target.value);
              if (customError) setCustomError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomSubmit();
            }}
            placeholder="Custom: 5,2,8,1,9,4"
            aria-label="Custom array input"
            aria-invalid={customError !== null}
            className={cn(customError && 'border-destructive focus-visible:ring-destructive')}
          />
          <Button size="sm" onClick={handleCustomSubmit} className="shrink-0">
            Use this
          </Button>
        </div>
        {customError && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5 shrink-0" />
            {customError}
          </p>
        )}
      </div>
    </div>
  );
}
