import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              checked: child.props.value === value,
              onClick: () => onValueChange(child.props.value),
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  checked?: boolean
  showRemove?: boolean
  onRemove?: () => void
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, checked, children, showRemove, onRemove, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 border rounded-lg text-left transition-colors",
          checked
            ? "border-gray-900 bg-white"
            : "border-gray-300 bg-white hover:border-gray-400",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
            checked ? "border-black" : "border-gray-300"
          )}
        >
          {checked && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
        </div>
        <span className="flex-1 text-sm text-gray-900">{children}</span>
        {checked && showRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.()
            }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
