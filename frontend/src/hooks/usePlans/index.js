import api, { openApi } from "../../services/api";

const usePlans = () => {
  const getPlanList = async (params) => {
    try {
      const { data } = await openApi.request({
        url: '/plans/list',
        method: 'GET',
        params,
        timeout: 30000, // Aumentando o timeout para 30 segundos
      });
      return data;
    } catch (error) {
      console.error("Erro ao carregar a lista de planos:", error.message);
      throw error;
    }
  };

  const list = async (params) => {
    try {
      const { data } = await api.request({
        url: '/plans/all',
        method: 'GET',
        params,
        timeout: 30000, // Aumentando o timeout para 30 segundos
      });
      return data;
    } catch (error) {
      console.error("Erro ao carregar todos os planos:", error.message);
      throw error;
    }
  };

  const finder = async (id) => {
    try {
      const { data } = await api.request({
        url: `/plans/${id}`,
        method: 'GET',
        timeout: 30000, // Aumentando o timeout para 30 segundos
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar o plano pelo ID:", error.message);
      throw error;
    }
  };

  // Mantendo o resto das funções como estavam

  return {
    getPlanList,
    list,
    save,
    update,
    finder,
    remove,
    getPlanCompany,
  };
};

export default usePlans;
