import { create } from "zustand";
import api from "../api/client";

export const useDashboardStore = create((set) => ({
  loading: false,
  error: null,
  overview: null,
  gradeDefault: [],
  gradeDistribution: [],
  modelMeta: null,
  featureImportance: [],
  gradeDrift: [],
  stateApplication: [],
  recalibration: [],
  riskFramework: null,

  fetchOverviewData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        overview,
        gradeDefault,
        gradeDistribution,
        modelMeta,
        featureImportance,
        riskFramework,
      ] = await Promise.all([
        api.get("/api/eda/overview"),
        api.get("/api/eda/grade-default"),
        api.get("/api/eda/grade-distribution"),
        api.get("/api/model/metadata"),
        api.get("/api/model/importance"),
        api.get("/api/risk-framework"),
      ]);

      set({
        loading: false,
        overview: overview.data,
        gradeDefault: gradeDefault.data,
        gradeDistribution: gradeDistribution.data,
        modelMeta: modelMeta.data,
        featureImportance: featureImportance.data,
        riskFramework: riskFramework.data,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  fetchMonitoringData: async () => {
    set({ loading: true, error: null });
    try {
      const [gradeDrift, stateApplication, recalibration] = await Promise.all([
        api.get("/api/monitoring/grade-drift"),
        api.get("/api/monitoring/state-application"),
        api.get("/api/monitoring/recalibration"),
      ]);

      set({
        loading: false,
        gradeDrift: gradeDrift.data,
        stateApplication: stateApplication.data,
        recalibration: recalibration.data,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  fetchDashboardData: async () => {
    await useDashboardStore.getState().fetchOverviewData();
  },

  runPrediction: async (payload) => {
    const result = await api.post("/api/predict", payload);
    return result.data;
  },
}));
