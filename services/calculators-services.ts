import { apiFetch } from "./http";
import type {
  NearAddRequest,
  ScalarResult,
  SphericalEquivalentRequest,
  TelescopeFovRequest,
  TranspositionRequest,
  TranspositionResult,
  VertexDistanceRequest,
} from "@/types/api-types";

/** POST /calculators/transposition → { sphere, cylinder, axis } */
export function transposition(body: TranspositionRequest): Promise<TranspositionResult> {
  return apiFetch<TranspositionResult>("/calculators/transposition", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /calculators/spherical-equivalent → { result } */
export function sphericalEquivalent(
  body: SphericalEquivalentRequest
): Promise<ScalarResult> {
  return apiFetch<ScalarResult>("/calculators/spherical-equivalent", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /calculators/near-add → { result } */
export function nearAdd(body: NearAddRequest): Promise<ScalarResult> {
  return apiFetch<ScalarResult>("/calculators/near-add", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /calculators/vertex-distance → { result } */
export function vertexDistance(body: VertexDistanceRequest): Promise<ScalarResult> {
  return apiFetch<ScalarResult>("/calculators/vertex-distance", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /calculators/telescope-fov → { result } */
export function telescopeFov(body: TelescopeFovRequest): Promise<ScalarResult> {
  return apiFetch<ScalarResult>("/calculators/telescope-fov", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
