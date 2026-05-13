import type { HTMLAttributes, LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function FieldGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('field-group', className)} {...props} />
}

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('field', className)} {...props} />
}

export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('field__label', className)} {...props} />
}

export function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('field__description', className)} {...props} />
}
