import React from 'react';
import { usePersistedFilters } from '../hooks/usePersistedFilters';

/**
 * Example component demonstrating filter persistence
 * This shows how to use the usePersistedFilters hook
 */
const FilterPersistenceExample: React.FC = () => {
  const { filters, setFilter, setFilters, resetFilters } = usePersistedFilters(
    'example-filters',
    {
      search: '',
      category: 'all',
      sort: 'newest',
      page: 1,
      minPrice: 0,
      maxPrice: 1000,
      inStock: true,
    }
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Filter Persistence Example
        </h2>
        <p className="text-gray-600 mb-6">
          Try changing the filters below. Notice how the URL updates and your preferences
          are saved. Refresh the page or share the URL to see persistence in action!
        </p>

        {/* Search Filter */}
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value, page: 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="mb-4">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              id="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilter('minPrice', Number(e.target.value))}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <input
              id="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* In Stock Checkbox */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilter('inStock', e.target.checked as any)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>

        {/* Page Number */}
        <div className="mb-4">
          <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-2">
            Page Number
          </label>
          <input
            id="page"
            type="number"
            value={filters.page}
            onChange={(e) => setFilter('page', Number(e.target.value))}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset All Filters
        </button>
      </div>

      {/* Current Filter State Display */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Filter State
        </h3>
        <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto">
          {JSON.stringify(filters, null, 2)}
        </pre>
        <p className="text-sm text-gray-600 mt-4">
          💡 <strong>Tip:</strong> Check your browser's URL bar to see how filters are stored
          in the URL. Try refreshing the page or sharing the URL with someone else!
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-4">
          ✨ Features Demonstrated
        </h3>
        <ul className="space-y-2 text-indigo-800">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>URL updates automatically when filters change</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Filters persist across page refreshes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Browser back/forward buttons work correctly</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Shareable URLs with filter state</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>localStorage saves user preferences</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Type-safe filter management</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Automatic cleanup on logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FilterPersistenceExample;
