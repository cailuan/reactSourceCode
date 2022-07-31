
export type BatchConfigTransition = {
  name?: string,
  startTime?: number,
  _updatedFibers?: Set<object>,
};

type BatchConfig = {
  transition: BatchConfigTransition | null,
};
const ReactCurrentBatchConfig:BatchConfig = {
  transition: null,
};

export default ReactCurrentBatchConfig;