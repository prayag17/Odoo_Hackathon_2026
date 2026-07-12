import { MinusIcon, PlusIcon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
import { Input } from '#/components/ui/input'

interface NumberFieldProps {
  id?: string
  value: string
  onValueChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  required?: boolean
  className?: string
}

// Wraps a numeric Input in a ButtonGroup with +/- steppers and hides the
// browser's native spinner arrows, so every numeric field in the app looks
// the same instead of falling back to the OS-drawn up/down control.
export function NumberField({
  id,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  placeholder,
  required,
  className,
}: NumberFieldProps) {
  function adjust(delta: number) {
    const current = Number(value) || 0
    let next = current + delta
    if (min != null) next = Math.max(min, next)
    if (max != null) next = Math.min(max, next)
    onValueChange(String(next))
  }

  return (
    <ButtonGroup className={className}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Decrease"
        onClick={() => adjust(-step)}
      >
        <MinusIcon />
      </Button>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Increase"
        onClick={() => adjust(step)}
      >
        <PlusIcon />
      </Button>
    </ButtonGroup>
  )
}
