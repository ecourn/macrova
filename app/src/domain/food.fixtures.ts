import type { FoodSnapshot } from "./contracts"
export const fixture = (): FoodSnapshot => ({
  version: 1,
  revision: "source-r1",
  sourceId: "catalogue:42",
  name: "Aliment",
  brand: "Marque",
  provenance: { name: "Catalogue", reference: "source://42" },
  capturedAt: 0,
  state: "unknown",
  basis: { kind: "known", unit: "g" },
  nutrition: {
    protein: "0",
    carbohydrate: "12.123456",
    fat: "1",
    energy: "100",
  },
})
