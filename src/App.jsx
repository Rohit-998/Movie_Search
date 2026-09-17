import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
import {useDebounce} from "react-use";
const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [moviesList, setMoviesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      if (!API_KEY) {
        setErrorMessage("TMDB API key is missing. Please define VITE_TMDB_API_KEY in your .env file.");
        setMoviesList([]);
        return;
      }
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endPoint, API_OPTIONS);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.status_message || `Failed to fetch movies (Status: ${response.status})`);
      }
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found for the given search term.");
        setMoviesList([]);
        return;
      }
      setMoviesList(data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage(error.message || "Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Logo" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section className="all-movies">
          <h2 className="mt-[40px]">{debouncedSearchTerm ? "Search Results" : "All Movies"}</h2>
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-red-500 text-center text-lg">{errorMessage}</p>
              <button
                type="button"
                onClick={() => fetchMovies(debouncedSearchTerm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg cursor-pointer transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
