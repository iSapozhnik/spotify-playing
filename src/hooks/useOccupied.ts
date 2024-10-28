import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import AppEnv from '../AppEnv.ts';

const useOccupied = () => {
  // Change this line to return true by default when occupancy is disabled
  const [occupied, setOccupied] = useState<boolean>(!AppEnv.ENABLE_OCCUPANCY || true);

  const updateIsOccupied = useCallback(() => {
    if (!AppEnv.ENABLE_OCCUPANCY) {
      setOccupied(true);
      return;
    }

    axios
      .get(`${AppEnv.HA_URL}/api/states/${AppEnv.HA_ENTITY}`, {
        headers: {
          Authorization: `Bearer ${AppEnv.HA_TOKEN}`,
        },
      })
      .then((response) => {
        setOccupied(response.data.state === 'on');
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (!AppEnv.ENABLE_OCCUPANCY) {
      console.info('Occupancy detection disabled');
      return;
    }

    const id = setInterval(updateIsOccupied, AppEnv.OCCUPIED_INTERVAL);
    updateIsOccupied();

    return () => clearInterval(id);
  }, [updateIsOccupied]);

  return occupied;
};

export default useOccupied;
