"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { DataPoint, Alert, KilnData } from '@/lib/types';
import { getAlertExplanationAction, logInsightEventAction } from '@/lib/actions';
import { useToast } from './use-toast';
import { format } from 'date-fns';

const MAX_DATA_POINTS = 30;
const UPDATE_INTERVAL = 2000; // 2 seconds

// --- Alert Thresholds ---
const TEMP_UPPER_THRESHOLD = 300;
const OXYGEN_LOWER_THRESHOLD = 10;
const ENERGY_UPPER_THRESHOLD = 150;

// --- Normal Operating Ranges ---
const NORMAL_TEMP_RANGE = { min: 240, max: 260 };
const NORMAL_OXYGEN_RANGE = { min: 18, max: 22 };
const NORMAL_ENERGY_RANGE = { min: 110, max: 130 };

// --- Anomaly Simulation ---
const ANOMALY_DURATION = 10000; // 10 seconds
const ANOMALY_TEMP = 310;
const ANOMALY_OXYGEN = 8;
const ANOMALY_ENERGY = 160;

const generateInitialData = (range: {min: number, max: number}): DataPoint[] => {
  const data: DataPoint[] = [];
  const now = Date.now();
  for (let i = MAX_DATA_POINTS - 1; i >= 0; i--) {
    data.push({
      time: format(new Date(now - i * UPDATE_INTERVAL), 'HH:mm:ss'),
      value: Math.random() * (range.max - range.min) + range.min,
    });
  }
  return data;
};

export const useKilnData = () => {
  const { toast } = useToast();
  const [kilnData, setKilnData] = useState<KilnData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAnomaly, setIsAnomaly] = useState(false);
  const anomalyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate initial data on the client side only
    setKilnData({
        temperature: generateInitialData(NORMAL_TEMP_RANGE),
        oxygen: generateInitialData(NORMAL_OXYGEN_RANGE),
        energy: generateInitialData(NORMAL_ENERGY_RANGE),
    });
    setIsLoading(false);
  }, []);

  const addAlert = useCallback(async (metric: 'Temperature' | 'Oxygen' | 'Energy', currentValue: number, threshold: number, ruleDescription: string) => {
    const newAlertId = `${metric}-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Prevent duplicate alerts for the same condition within a short time
    const recentAlert = alerts.find(a => a.metric === metric && (Date.now() - new Date(a.timestamp).getTime()) < 60000);
    if(recentAlert) return;

    // Call AI for explanation
    const explanationResult = await getAlertExplanationAction({
      metric,
      currentValue,
      threshold,
      timestamp,
      ruleDescription,
    });

    const newAlert: Alert = {
      id: newAlertId,
      metric,
      currentValue,
      threshold,
      timestamp,
      ruleDescription,
      ...explanationResult,
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    toast({
        variant: "destructive",
        title: `🚨 ${metric} Alert`,
        description: ruleDescription,
    });

    // Log the insight event
    logInsightEventAction({
        type: 'alert',
        title: `Predicted ${metric} Anomaly`,
        description: `Confidence: ${(explanationResult.confidenceScore * 100).toFixed(0)}%`,
        metadata: {
            metric,
            currentValue,
            threshold,
            confidence: explanationResult.confidenceScore,
        }
    });
  }, [alerts, toast]);

  const simulateAnomaly = useCallback(() => {
    setIsAnomaly(true);
    toast({
        title: "🔥 Anomaly Simulation Activated",
        description: "Kiln metrics will spike for a short period.",
    });

    if (anomalyTimeoutRef.current) {
        clearTimeout(anomalyTimeoutRef.current);
    }

    anomalyTimeoutRef.current = setTimeout(() => {
        setIsAnomaly(false);
        toast({
            title: "✅ Anomaly Simulation Ended",
            description: "Kiln metrics returning to normal.",
        });
    }, ANOMALY_DURATION);

  }, [toast]);


  useEffect(() => {
    if(isLoading) return;

    const interval = setInterval(() => {
      setKilnData(prevData => {
        if (!prevData) return null;

        const now = new Date();
        const time = format(now, 'HH:mm:ss');
        
        let newTempValue, newO2Value, newEnergyValue;

        if (isAnomaly) {
            newTempValue = ANOMALY_TEMP + (Math.random() - 0.5) * 10;
            newO2Value = ANOMALY_OXYGEN + (Math.random() - 0.5) * 2;
            newEnergyValue = ANOMALY_ENERGY + (Math.random() - 0.5) * 10;
        } else {
            newTempValue = NORMAL_TEMP_RANGE.min + Math.random() * (NORMAL_TEMP_RANGE.max - NORMAL_TEMP_RANGE.min);
            newO2Value = NORMAL_OXYGEN_RANGE.min + Math.random() * (NORMAL_OXYGEN_RANGE.max - NORMAL_OXYGEN_RANGE.min);
            newEnergyValue = NORMAL_ENERGY_RANGE.min + Math.random() * (NORMAL_ENERGY_RANGE.max - NORMAL_ENERGY_RANGE.min);
        }

        // Check for alerts
        if (newTempValue > TEMP_UPPER_THRESHOLD) {
          addAlert('Temperature', newTempValue, TEMP_UPPER_THRESHOLD, `Temperature ${newTempValue.toFixed(1)}°C exceeds threshold of ${TEMP_UPPER_THRESHOLD}°C.`);
        }
        if (newO2Value < OXYGEN_LOWER_THRESHOLD) {
          addAlert('Oxygen', newO2Value, OXYGEN_LOWER_THRESHOLD, `Oxygen level ${newO2Value.toFixed(1)}% is below threshold of ${OXYGEN_LOWER_THRESHOLD}%.`);
        }
        if (newEnergyValue > ENERGY_UPPER_THRESHOLD) {
            addAlert('Energy', newEnergyValue, ENERGY_UPPER_THRESHOLD, `Energy consumption ${newEnergyValue.toFixed(1)} kWh exceeds threshold of ${ENERGY_UPPER_THRESHOLD} kWh.`);
        }

        const newTemperature = [...prevData.temperature, { time, value: newTempValue }].slice(-MAX_DATA_POINTS);
        const newOxygen = [...prevData.oxygen, { time, value: newO2Value }].slice(-MAX_DATA_POINTS);
        const newEnergy = [...prevData.energy, { time, value: newEnergyValue }].slice(-MAX_DATA_POINTS);

        return {
          temperature: newTemperature,
          oxygen: newOxygen,
          energy: newEnergy,
        };
      });
    }, UPDATE_INTERVAL);

    return () => {
        clearInterval(interval);
        if (anomalyTimeoutRef.current) {
            clearTimeout(anomalyTimeoutRef.current);
        }
    };
  }, [isAnomaly, addAlert, isLoading]);

  return { kilnData, alerts, simulateAnomaly, isLoading };
};
