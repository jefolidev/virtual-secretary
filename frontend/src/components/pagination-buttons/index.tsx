import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../ui/button'

interface PaginationButtonsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  position: 'start' | 'center' | 'end'
}

export function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
  position,
}: PaginationButtonsProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const handleJumpToFirstPage = () => {
    onPageChange(1)
  }

  const handleBackwardPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleFowardPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleJumpToLastPage = () => {
    onPageChange(totalPages)
  }

  return (
    <div
      className={`flex items-end justify-${position === 'start' ? 'start' : position === 'center' ? 'center' : 'end'} gap-2 mt-6`}
    >
      <Button
        variant={'outline'}
        onClick={handleJumpToFirstPage}
        disabled={currentPage === 1}
      >
        <ChevronFirst />
      </Button>
      <Button
        variant={'outline'}
        onClick={handleBackwardPage}
        disabled={currentPage === 1}
      >
        <ChevronLeft />
      </Button>
      <Button
        variant={'outline'}
        onClick={handleFowardPage}
        disabled={currentPage === totalPages}
      >
        <ChevronRight />
      </Button>
      <Button
        variant={'outline'}
        onClick={handleJumpToLastPage}
        disabled={currentPage === totalPages}
      >
        <ChevronLast />
      </Button>
    </div>
  )
}
