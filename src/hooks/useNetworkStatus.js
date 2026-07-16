import { useEffect, useState } from 'react';
{/*Imports the NetInfo library.This library can detect whether the device is connected to a network,
  whether it is reachable and the connection type of the internet  
  */}
import NetInfo from '@react-native-community/netinfo';

export default function useNetworkStatus() {
  const [state, setState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
{/* Whenever NetInfo returns new information, this function updates the React state. */}
  useEffect(() => {
    const applyState = (netState) => {
      setState({
        isConnected: netState.isConnected ?? true,
        isInternetReachable: netState.isInternetReachable ?? true,
        type: netState.type,
      });
    };

    const unsubscribe = NetInfo.addEventListener(applyState);
    NetInfo.fetch().then(applyState);

    return () => unsubscribe();
  }, []);

  return state;
}

