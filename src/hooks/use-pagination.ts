import { useState } from 'react';

export interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  totalItems: number;
}

export const usePagination = <T>({ 
  data, 
  itemsPerPage = 10, 
  totalItems 
}: UsePaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
    return newPage;
  };

  const nextPage = () => {
    return goToPage(currentPage + 1);
  };

  const previousPage = () => {
    return goToPage(currentPage - 1);
  };

  const reset = () => {
    setCurrentPage(1);
    return 1;
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData : data,
    goToPage,
    nextPage,
    previousPage,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
    endIndex: totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0,
    totalItems,
    setCurrentPage
  };
};