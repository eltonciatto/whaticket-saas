import api from "../../services/api";

const useCompanies = () => {
  const find = async (id) => {
    try {
      const { data } = await api.request({
        url: `/companies/${id}`,
        method: 'GET',
        timeout: 30000, // Aumentando o timeout para 30 segundos
      });
      return data;
    } catch (error) {
      console.error("Erro ao carregar os dados da empresa:", error.message);
      throw error;
    }
  };

  // Mantendo o resto das funções como estavam

  return {
    save,
    update,
    remove,
    list,
    find,
    finding,
    findAll,
    updateSchedules,
  };
};

export default useCompanies;
