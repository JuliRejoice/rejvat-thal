import type { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from 'react'
import { Control, Controller, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form'

import { cn } from '@/lib/utils'
// import { AlertIcon, InfoCircleIcon } from '../icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
// import { FormInputProps } from './types'

type BaseInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export type FormInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    control: Control<TFieldValues>
    id?: string
    name: TName
    label?: string
    className?: string
    labelClassName?: string
    containerClassName?: string
    noValidate?: boolean
    fullWidth?: boolean
}

type ExtendedFormInputProps = {
  startIcon?: ReactNode
  endIcon?: ReactNode
  info?: string
  helperText?: string
}

const TextFormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  control,
  id,
  name,
  label,
  className,
  labelClassName,
  containerClassName,
  noValidate,
  fullWidth,
  info,
  helperText,
  startIcon,
  endIcon,
  ...other
}: FormInputProps<TFieldValues> & BaseInputProps & ExtendedFormInputProps) => {
  return (
    <Controller<TFieldValues, TName>
      control={control}
      name={name as TName}
      defaultValue={'' as PathValue<TFieldValues, TName>}
      render={({ field, fieldState }) => {
        const showError = !noValidate && fieldState.error?.message
        return (
          <div className={cn(containerClassName, 'relative', { 'max-w-full': fullWidth })}>
            {label && (
              <Label className={cn('text-body-sm-medium mb-1.5 block', labelClassName)} htmlFor={name}>
                {label}
                {info && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* <InfoCircleIcon size={14} className="ml-2 size-3.5 text-text-placeholder" /> */}
                    </TooltipTrigger>
                    <TooltipContent>{info}</TooltipContent>
                  </Tooltip>
                )}
              </Label>
            )}
            <div className={cn('relative', fullWidth && 'max-w-full')}>
              <Input
                {...other}
                {...field}
                id={id ?? name}
                className={cn(
                  { 'ps-10': startIcon },
                  { 'pe-14': endIcon },
                  { 'w-full': fullWidth },
                  { 'border-error-500 focus:border-error-500': showError },
                  className
                )}
              />

              {/* TODO, configure this later when requirement arises, also add endIcon over here */}
              {startIcon && <span className="absolute start-3 top-1/2 -translate-y-1/2">{startIcon}</span>}

              {showError && (
                <div className='pointer-events-none absolute inset-y-0 flex items-center end-3'>
                  {/* <AlertIcon size={24} className="size-6 text-error-500" /> */}
                </div>
              )}
            </div>

            {(showError || helperText) && (
              <p className={cn("mt-1.5 text-body-sm", showError ? 'text-error-500' : 'text-text-placeholder')}>
                {fieldState.error?.message || helperText}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

export default TextFormInput