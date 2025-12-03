import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Simple pagination logic: show all if <= 7, otherwise show start, end, and current neighborhood
    // For simplicity in this version, let's show a max of 5 page numbers with ellipses if needed.

    // Generating page numbers
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currentPage > 3) {
                pageNumbers.push('...');
            }

            // Show current page and neighbors
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            }
            if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    return (
        <div className={cn("flex items-center justify-center space-x-2 mt-8", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-1">
                {renderPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    "w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-200",
                                    currentPage === page
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default Pagination;
