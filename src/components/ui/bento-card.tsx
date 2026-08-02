import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function BentoCard({ title, description, children, className, contentClassName, ...props }: BentoCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)} {...props}>
      {(title || description) && (
        <CardHeader className="p-4 pb-2">
          {title && <CardTitle className="text-lg font-medium">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
