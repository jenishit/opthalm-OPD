// Shapes for the /calculators endpoints. Mirrors the Go backend contract
// served at ${BACKEND_URL}/swagger/doc.json.

export interface TranspositionRequest {
  sphere: number;
  cylinder: number;
  axis: number;
}

export interface TranspositionResult {
  sphere: number;
  cylinder: number;
  axis: number;
}

export interface SphericalEquivalentRequest {
  sphere: number;
  cylinder: number;
}

export interface NearAddRequest {
  distance_sphere: number;
  add_power: number;
}

export interface VertexDistanceRequest {
  power: number;
  from_distance_mm: number;
  to_distance_mm: number;
}

export interface TelescopeFovRequest {
  true_fov_degrees: number;
  magnification: number;
}

export interface ScalarResult {
  result: number;
}
