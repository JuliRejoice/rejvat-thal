import React from 'react'
import { TableCell, TableRow } from '../ui/table'

const SkeletonRestaurantManag = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center space-x-3">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-52 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default SkeletonRestaurantManag