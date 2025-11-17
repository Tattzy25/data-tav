import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"

interface ButtonGroupInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSearch?: () => void
  className?: string
}

export function ButtonGroupInput({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
  className,
}: ButtonGroupInputProps) {
  return (
    <ButtonGroup className={className}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-r-none"
      />
      <Button
        variant="outline"
        aria-label="Search"
        type="button"
        onClick={onSearch}
        className="rounded-l-none"
      >
        <SearchIcon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
