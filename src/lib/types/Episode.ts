interface Episode {
    id: number;
    url: string;
    name: string;
    season: number;
    number: number;
    type: string;
    airdate: string;
    airtime: string;
    airstamp: string;
    runtime: number;
    rating: {
        average: number | null;
    };
    image: {
        medium: string;
        original: string;
    };
    summary: string;
    _links: {
        self: {
            href: string;
        };
        show: {
            href: string;
            name: string;
        };
    };
}

// Type for the response from your getShows function
interface ApiResponse<T> {
    status: number;
    data: T;
    // You might want to include other properties from the Response object if needed
  }
  
  export type { Episode, ApiResponse };