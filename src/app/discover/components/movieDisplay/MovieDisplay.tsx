"use client";
import { MdRefresh, MdClose, MdAccessTimeFilled, MdStar } from "react-icons/md";
import { genreType, genres } from "../allGenres/AllGenres";
import { useState, useEffect } from "react";
import Image from "next/image";
import { filterType } from "../setFilters/SetFilters";

interface filmType {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  };
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: {
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface actorType {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

interface watchProviderType {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

interface MovieDisplayProps {
  filters?: filterType;
  selectedGenre?: genreType;
  setSelectedGenre: Function;
}

export default function MovieDisplay({
  selectedGenre,
  setSelectedGenre,
  filters,
}: MovieDisplayProps) {
  const [film, setFilm] = useState<filmType>();
  const [lastReset, setLastReset] = useState<number>(0);
  const [watchProviders, setWatchProviders] = useState<watchProviderType[]>();
  const [cast, setCast] = useState<actorType[]>();

  useEffect(() => {
    if (selectedGenre) {
      setFilm(undefined);
      setWatchProviders(undefined);
      setCast(undefined);

      let sortList = [];
      filters?.enabledSorts.popularity ? sortList.push("popularity.desc") : null;
      filters?.enabledSorts.revenue ? sortList.push("revenue.desc") : null;
      filters?.enabledSorts.votes ? sortList.push("vote_count.desc") : null;
      filters?.enabledSorts.date ? sortList.push("primary_release_date.desc") : null;
      const sort = sortList[Math.round((sortList.length - 1) * Math.random())];

      const page = Math.round(10 * Math.random()) + 1;

      const adultFilter = `${filters?.adult ? "" : "&include_adult=false"}`;

      const watchProviders = `&watch_region=BR&with_watch_providers=${filters?.watchProviders.join(
        "|"
      )}`;

      const url = `https://api.themoviedb.org/3/discover/movie?language=pt-BR&page=${page}&sort_by=${sort}${
        selectedGenre.id >= 0 ? `&with_genres=${selectedGenre?.id}` : ""
      }${adultFilter}${watchProviders}`;
      console.log(url);

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNThkZjI3NjVlNzVjZjcxOTU3OTQwOWQwYTZlZDE0ZCIsInN1YiI6IjYwNGU0N2I5NzMxNGExMDA0MGYzM2ZiOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wcXwGa73OY0MtxHkeJtPxNLk6POBstoCWWEd-a9XOXs",
        },
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((json) => {
          const selectedFilm: filmType = json.results[Math.round(Math.random() * 19)];
          console.log(selectedFilm, json);
          fetch(
            `https://api.themoviedb.org/3/movie/${selectedFilm.id}?language=pt-BR`,
            options
          )
            .then((res) => res.json())
            .then((json) => {
              console.log(json);

              setFilm(json);
            });
          fetch(
            `https://api.themoviedb.org/3/movie/${selectedFilm.id}/watch/providers`,
            options
          )
            .then((res) => res.json())
            .then((json) => {
              setWatchProviders(json.results["BR"]?.flatrate);
              console.log(json.results["BR"]?.flatrate);
              fetch(
                `https://api.themoviedb.org/3/movie/${selectedFilm.id}/credits?language=pt-BR`,
                options
              )
                .then((res) => res.json())
                .then((json) => {
                  setCast(json.cast);
                });
            });
        });
    }
  }, [selectedGenre, lastReset]);

  return (
    <div
      className={`${
        selectedGenre !== undefined
          ? "opacity-100 scale-100 z-50"
          : "opacity-0 scale-110 z-0"
      } ease-in-out duration-200 flex flex-col w-full absolute h-full top-0 left-1/2 -translate-x-1/2 items-center`}>
      <div className="static top-0 z-50 flex justify-between w-full px-4 py-2 shadow-lg h-min">
        <div className="flex items-center gap-3">
          <div
            className={`${
              genres.find((e) => e.id == selectedGenre?.id)?.bgColorClass
            } w-0.5 h-3/4 rounded-full`}></div>
          <p className="text-xl text-white">{selectedGenre?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <MdRefresh
            onClick={() => setLastReset(Date.now())}
            className={`text-white text-3xl cursor-pointer`}
          />
          <MdClose
            onClick={() => setSelectedGenre(undefined)}
            className={`text-white text-4xl cursor-pointer`}
          />
        </div>
      </div>
      <div className="flex flex-col items-center w-full h-full overflow-x-hidden overflow-y-auto styled-scroll">
        <div
          className="flex-col w-full ease-in-out bg-center bg-cover duration-200flex"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${film?.backdrop_path})`,
          }}>
          <div className="scale-[1.01] ease-in-out items-center pt-4 sm:pt-12 duration-200 flex flex-col w-full bg-gradient-to-b from-[#0009] to-zinc-800">
            <div className="flex flex-col w-full max-w-xl">
              {film !== undefined && (
                <div className="flex flex-col w-full h-full px-4">
                  <div className="flex flex-col gap-4">
                    <h1 // Título
                      className={"text-white text-3xl font-bold"}>
                      {film?.title}
                      <span className="ml-3 text-base text-white text-opacity-50">
                        ({new Date(film?.release_date || Date.now()).getFullYear()})
                      </span>
                    </h1>
                    <div // Foto e informações
                      className="flex h-56 gap-4">
                      {/* Foto do filme */}
                      {film?.poster_path && (
                        <Image
                          src={`https://image.tmdb.org/t/p/original${film?.poster_path}`}
                          className="flex-shrink-0 object-cover h-full bg-black bg-opacity-50 rounded-lg w-min"
                          alt={"Poster do filme"}
                          width={2000}
                          height={3000}
                          priority
                        />
                      )}
                      {/* Informações do filme */}
                      <div className="flex flex-col gap-2 py-2">
                        <p // Descrição
                          className={
                            "text-white text-sm h-full text-opacity-70 leading-tight styled-scroll overflow-auto pr-2"
                          }>
                          {film?.overview}
                        </p>
                        <div // Categorias
                          className="flex flex-wrap-reverse flex-shrink-0 w-full gap-2 mt-2 overflow-x-auto">
                          {film?.genres.map((e: genreType) => {
                            return (
                              <p
                                className="px-3 text-sm text-white bg-white rounded-full cursor-pointer h-min whitespace-nowrap bg-opacity-5 text-opacity-70"
                                onClick={() => {
                                  setSelectedGenre(e);
                                }}
                                key={e.id}>
                                {e.name}
                              </p>
                            );
                          })}
                        </div>
                        <div // Tempo e Estrelas
                          className="flex gap-4">
                          <div className="flex items-center gap-1 text-white text-opacity-50">
                            <MdAccessTimeFilled className="text-lg" />
                            {typeof film?.runtime === "number" && (
                              <p className="tracking-wide">
                                {Math.floor(film?.runtime / 60)}h
                                {film?.runtime - Math.floor(film?.runtime / 60) * 60}m
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-white text-opacity-50">
                            <MdStar className="text-lg" />
                            {typeof film?.runtime === "number" && (
                              <p className="tracking-wide">
                                {film.vote_average.toFixed(1)}/10
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {film === undefined && (
                <div className="flex items-center justify-center w-full h-full my-16">
                  <div className="w-16 h-16 border-t-2 border-l-2 border-white border-opacity-50 border-solid rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        {(watchProviders?.length || 0) > 0 && (
          <div className="flex flex-col w-full max-w-xl gap-2 px-4 pt-4">
            <h1 // Onde assistir
              className={"text-white text-2xl font-bold"}>
              Onde assistir <span className="ml-1 text-lg opacity-75">(JustWatch)</span>
            </h1>
            <div className="relative flex w-full">
              <div className="top-0 -right-[2px] h-full w-12 absolute z-10 bg-gradient-to-r from-transparent to-zinc-800"></div>
              <div className="flex gap-1 pr-20 overflow-x-auto scroll-zero">
                {watchProviders?.map((e) => {
                  return (
                    <Image
                      className="object-cover w-16 h-16 duration-200 ease-in-out bg-black bg-opacity-50 rounded-lg hover:scale-90"
                      src={`https://image.tmdb.org/t/p/original${e.logo_path}`}
                      alt={"provedor " + e.provider_name}
                      key={e.provider_id}
                      width={256}
                      height={256}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {film !== undefined && (
          <div className="flex flex-col w-full max-w-xl px-4 pt-4 text-white">
            <h1 // Produção
              className={"text-2xl font-bold"}>
              Produção
            </h1>
            <p className="opacity-75">
              {film?.production_companies.map((e) => e.name).join(", ")}
            </p>
          </div>
        )}
        {(cast?.length || 0) > 0 && (
          <div className="flex flex-col w-full max-w-xl gap-2 p-4">
            <h1 // Elenco
              className={"text-white text-2xl font-bold"}>
              Elenco
            </h1>
            <div className="relative flex w-full">
              <div className="top-0 -right-[2px] h-full w-12 absolute z-10 bg-gradient-to-r from-transparent to-zinc-800"></div>
              <div className="flex gap-3 pr-20 overflow-x-auto scroll-zero">
                {cast?.slice(0,15)?.map((e) => {
                  return (
                    <div
                      className="flex flex-col flex-shrink-0 w-48 overflow-hidden rounded-lg shadow bg-zinc-900"
                      key={e.credit_id}>
                      {e.profile_path && (
                        <Image
                          className="object-cover w-full duration-200 ease-in-out bg-white bg-opacity-50 aspect-square"
                          src={`https://image.tmdb.org/t/p/original${e.profile_path}`}
                          alt={"Foto de " + e.name}
                          width={256}
                          height={256}
                        />
                      )}
                      {!e.profile_path && (
                        <div className="object-cover w-full duration-200 ease-in-out bg-white bg-opacity-50 aspect-square"></div>
                      )}
                      <div className="flex flex-col px-4 py-3 text-white">
                        <p className="overflow-hidden text-xl leading-tight whitespace-nowrap overflow-ellipsis">
                          {e.name}
                        </p>
                        <p className="overflow-hidden opacity-50 whitespace-nowrap overflow-ellipsis">
                          {e.character}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
