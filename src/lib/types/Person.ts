interface Country {
    name: string;
    code: string;
    timezone: string;
}

interface Person {
    id: number;
    url: string;
    name: string;
    country: Country | null;
    birthday: string | null;
    deathday: string | null;
    gender: string | null;
    image: {
        medium: string;
        original: string;
    } | null;
    updated: number;
    _links: {
        self: {
            href: string;
        };
    };
}

interface SearchResult {
    score: number;
    person: Person;
  }

interface ApiResponse<T> {
    status: number;
    data: T;
    // You might want to include other properties from the Response object if needed
  }
  
  export type { Person, SearchResult, ApiResponse };

  