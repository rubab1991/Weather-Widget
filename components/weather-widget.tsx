"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon } from "lucide-react";

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      console.log("Weather API Key:", apiKey);
      if (!apiKey) {
        throw new Error("API key is missing or undefined. Check .env.local");
      }

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${trimmedLocation}`
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Invalid API key or you've exceeded your quota");
        } else if (response.status === 400) {
          throw new Error("Invalid city name. Please try again.");
        } else {
          throw new Error("City not found");
        }
      }

      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };

      setWeather(weatherData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching weather data:", error.message);
        setError(error.message);
      } else {
        console.error("An unexpected error occurred.");
        setError("An unexpected error occurred.");
      }
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  function getTemperatureMessage(temperature: number, unit: string): React.ReactNode {
    if (unit === "C") {
      if (temperature <= 0) return "It's freezing!";
      if (temperature < 15) return "It's a bit chilly.";
      if (temperature < 25) return "The weather is pleasant.";
      return "It's warm!";
    } else if (unit === "F") {
      if (temperature <= 32) return "It's freezing!";
      if (temperature < 59) return "It's a bit chilly.";
      if (temperature < 77) return "The weather is pleasant.";
      return "It's warm!";
    } else {
      return "Unknown temperature unit.";
    }
  }

  function getWeatherMessage(description: string): React.ReactNode {
    return `Current weather: ${description}`;
  }

  function getLocationMessage(location: string): React.ReactNode {
    return `Location: ${location}`;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Weather Widget</CardTitle>
          <CardDescription>
            Search for the current weather conditions in your city.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocation(e.target.value)
              }
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && <div className="mt-4 text-red-500">{error}</div>}
          {weather && (
            <div className="mt-4 grid gap-2">
              <div className="flex items-center gap-2">
                <ThermometerIcon className="w-6 h-6" />
                {getTemperatureMessage(weather.temperature, weather.unit)}
              </div>
              <div className="flex items-center gap-2">
                <CloudIcon className="w-6 h-6" />
                <div>{getWeatherMessage(weather.description)}</div>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-6 h-6" />
                <div>{getLocationMessage(weather.location)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
