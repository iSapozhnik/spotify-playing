import { useCallback, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from 'react-oauth2-code-pkce';

import useRequest from '../api/useRequest.ts';
import AppEnv from '../AppEnv.ts';
import useDeepEqualMemo from './useDeepEqualMemo.ts';

const useGetCurrentlyPlaying = (enable: boolean) => {
  const { token } = useContext(AuthContext);

  const getCurrentlyPlaying = useCallback(
    () =>
      axios
        .get<SpotifyApi.CurrentlyPlayingObject | null>(
          'https://api.spotify.com/v1/me/player/currently-playing',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 204) {
            response.data = null;
          }

          console.log('Spotify API response:', response.status, response.data);

          if (response.data) {
            // Clear some of the values that we don't care about, but which
            // cause the object to change.
            response.data.actions.disallows = {};
            response.data.timestamp = 0;
            response.data.progress_ms = 0;
            response.data.is_playing = true;
          }

          return response;
        }),
    [token]
  );

  const { loading, previouslyLoaded, data, loadData } =
    useRequest(getCurrentlyPlaying);

  const currentlyPlaying =
    useDeepEqualMemo<SpotifyApi.CurrentlyPlayingObject | null>(data);

  useEffect(() => {
    let id: number | undefined = undefined;

    if (enable) {
      console.log('Setting up Spotify polling interval');
      id = setInterval(loadData, AppEnv.SPOTIFY_INTERVAL);
      void loadData();
    } else {
      console.log('Spotify polling disabled');
    }

    return () => {
      if (id) {
        clearInterval(id);
      }
    };
  }, [loadData, enable]);

  return {
    loading,
    previouslyLoaded,
    currentlyPlaying,
  };
};

export default useGetCurrentlyPlaying;
