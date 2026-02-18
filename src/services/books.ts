// src/services/books.ts
import api from './api';

export interface Book {
  id: number;
  accession_number: string;
  title: string;
  author: string;
  book_isbn: string;
  subject: string;
  book_place: string;
  book_publisher: string;
  year: string;
  book_edition: string;
  book_supplementary: string;
  description: string;
  availability: 'Available' | 'Borrowed';
  call_number: string;
  image_url?: string;
}

export interface BooksResponse {
  success: boolean;
  data: Book[];
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
    has_more: boolean;
  };
}

// Mock data for development if API is not available
const MOCK_BOOKS: Book[] = [
  {
    id: 1,
    accession_number: '00007698',
    title: 'Nutrition for Food Service and Culinary Professionals',
    author: 'Drummond, Karen Eich',
    book_isbn: '978-0470057421',
    subject: 'Nutrition Food Service',
    book_place: 'Philippines',
    book_publisher: 'Unilever',
    year: '2000',
    book_edition: 'na',
    book_supplementary: 'N/A',
    description: 'A comprehensive guide to nutrition for those in the food service industry.',
    availability: 'Available',
    call_number: 'N/A',
  },
  {
    id: 2,
    accession_number: '00007699',
    title: 'Primer on Investment Portfolio Management',
    author: 'na',
    book_isbn: 'na',
    subject: 'Finance',
    book_place: 'Philippines',
    book_publisher: 'na',
    year: '2010',
    book_edition: 'na',
    book_supplementary: 'N/A',
    description: 'NA',
    availability: 'Available',
    call_number: 'N/A',
  },
  {
    id: 3,
    accession_number: '00007700',
    title: 'Physical activity towards health and fitness',
    author: 'Medina-Bulatao, Mary Grace',
    book_isbn: 'na',
    subject: 'Physical Education -- Exercise.',
    book_place: 'Philippines',
    book_publisher: 'na',
    year: '2015',
    book_edition: 'na',
    book_supplementary: 'N/A',
    description: 'NA',
    availability: 'Available',
    call_number: 'N/A',
  },
  {
    id: 4,
    accession_number: '00007701',
    title: 'College Algebra : Text / Workbook',
    author: 'Salamat, Lorina G. and Sta.Maria',
    book_isbn: 'na',
    subject: 'Algebra -- Problems, Exercises...',
    book_place: 'Philippines',
    book_publisher: 'na',
    year: '2018',
    book_edition: 'na',
    book_supplementary: 'N/A',
    description: 'NA',
    availability: 'Available',
    call_number: 'N/A',
  },
  // Add more mock books to test pagination
  ...Array.from({ length: 46 }, (_, i) => ({
    id: i + 5,
    accession_number: `0000${7702 + i}`,
    title: `Sample Book Title ${i + 1}`,
    author: i % 3 === 0 ? 'John Doe' : `Author ${i + 1}`,
    book_isbn: `ISBN-${1000 + i}`,
    subject: i % 2 === 0 ? 'General Science' : 'History',
    book_place: 'Philippines',
    book_publisher: 'Sample Publisher',
    year: (2000 + (i % 25)).toString(),
    book_edition: '1st',
    book_supplementary: 'N/A',
    description: 'This is a sample description for a book in the library.',
    availability: i % 7 === 0 ? 'Borrowed' : 'Available' as 'Available' | 'Borrowed',
    call_number: `CALL-${100 + i}`,
  })),
];

/**
 * Helper to apply specialized sorting logic to a list of books.
 */
const applySorting = (books: Book[], orderBy: string): Book[] => {
  const sortedBooks = [...books];
  const isLetter = (str: string) => /^[a-zA-Z]/.test(str);
  
  // Helper to extract a numeric year from messy strings like "c2001" or "[2001]"
  const extractYear = (yearStr: string): number => {
    if (!yearStr || yearStr === '0000' || yearStr.toLowerCase() === 'na') return 0;
    const match = yearStr.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : 0;
  };

  switch (orderBy) {
    case 'Title (A-Z)':
      sortedBooks.sort((a, b) => {
        const aTitle = a.title || '';
        const bTitle = b.title || '';
        const aIsLetter = isLetter(aTitle);
        const bIsLetter = isLetter(bTitle);

        if (aIsLetter && !bIsLetter) return -1;
        if (!aIsLetter && bIsLetter) return 1;
        return aTitle.localeCompare(bTitle);
      });
      break;
    case 'Title (Z-A)':
      sortedBooks.sort((a, b) => {
        const aTitle = a.title || '';
        const bTitle = b.title || '';
        const aIsLetter = isLetter(aTitle);
        const bIsLetter = isLetter(bTitle);

        if (aIsLetter && !bIsLetter) return -1;
        if (!aIsLetter && bIsLetter) return 1;
        return bTitle.localeCompare(aTitle);
      });
      break;
    case 'Year (Oldest)':
      sortedBooks.sort((a, b) => {
        const aY = extractYear(a.year);
        const bY = extractYear(b.year);
        
        // 0 means invalid/0000/na - move to end
        if (aY !== 0 && bY === 0) return -1;
        if (aY === 0 && bY !== 0) return 1;
        if (aY === 0 && bY === 0) return 0;
        
        return aY - bY;
      });
      break;
    case 'Year (Newest)':
      sortedBooks.sort((a, b) => {
        const aY = extractYear(a.year);
        const bY = extractYear(b.year);
        
        // 0 means invalid/0000/na - move to end
        if (aY !== 0 && bY === 0) return -1;
        if (aY === 0 && bY !== 0) return 1;
        if (aY === 0 && bY === 0) return 0;
        
        return bY - aY;
      });
      break;
    default:
      break;
  }
  return sortedBooks;
};

/**
 * Fetches books from the API with optional searching and pagination.
 */
export const fetchBooks = async (
  page: number = 1,
  limit: number = 20,
  search: string = '',
  orderBy: string = 'Default Order',
  status: string = 'All Status'
): Promise<{ books: Book[]; total: number; lastPage: number }> => {
  try {
    // Mapping our internal filter values to API expected parameters
    const params = {
      page,
      limit,
      search: search || undefined,
      order_by: orderBy !== 'Default Order' ? orderBy : undefined,
      status: status !== 'All Status' ? status.toLowerCase() : undefined,
    };

    const response = await api.get<BooksResponse>('/api/books', { params });
    
    if (response.data && response.data.success) {
      const pagination = response.data.pagination;
      let books = response.data.data || [];
      
      // Apply specialized sorting to the API results locally 
      // because the API might not support our exact "non-letters to back" logic
      books = applySorting(books, orderBy);

      return { 
        books: books, 
        total: pagination ? pagination.total : books.length,
        lastPage: pagination ? pagination.last_page : 1
      };
    }
    
    throw new Error('API response unsuccessful');
  } catch (error) {
    console.warn('Failed to fetch from API, falling back to mock data:', error);
    
    // Fallback to mock data logic
    let filteredBooks = [...MOCK_BOOKS];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.accession_number.toLowerCase().includes(lowerSearch) ||
          book.title.toLowerCase().includes(lowerSearch) ||
          book.author.toLowerCase().includes(lowerSearch) ||
          book.book_isbn.toLowerCase().includes(lowerSearch)
      );
    }

    if (status !== 'All Status') {
      filteredBooks = filteredBooks.filter((book) => book.availability === status);
    }

    // Apply specialized sorting to mock data
    filteredBooks = applySorting(filteredBooks, orderBy);

    const total = filteredBooks.length;
    const lastPage = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedBooks = filteredBooks.slice(start, start + limit);

    return { books: paginatedBooks, total, lastPage };
  }
};
