import { BoardPosition } from '../config/boardConfig';
import { BoardZoneObject, PlayerSide, ZoneObjectType } from '../types/heroDuelTypes';
import { getChebyshevDistance, isSamePos } from './boardGeometry';

let zoneCounter = 0;

export function createZone(
  type: ZoneObjectType,
  owner: PlayerSide,
  position: BoardPosition,
  durationTurns: number,
  pairedPortalPos?: BoardPosition
): BoardZoneObject {
  zoneCounter += 1;
  return {
    id: `zone_${type}_${Date.now()}_${zoneCounter}`,
    type,
    owner,
    position,
    durationTurns,
    pairedPortalPos,
  };
}

export function isSquareBlockedByZone(zones: BoardZoneObject[], pos: BoardPosition): boolean {
  return zones.some((z) => {
    // Impassable walls and solid decoys block pieces from landing or passing through
    if (z.type === 'wall' || z.type === 'decoy') {
      return isSamePos(z.position, pos);
    }
    return false;
  });
}

export function getDecoyAt(zones: BoardZoneObject[], pos: BoardPosition): BoardZoneObject | undefined {
  return zones.find((z) => z.type === 'decoy' && isSamePos(z.position, pos));
}

export function getBannerBuff(zones: BoardZoneObject[], pos: BoardPosition, side: PlayerSide): boolean {
  return zones.some(
    (z) => z.type === 'banner' && z.owner === side && getChebyshevDistance(z.position, pos) <= 1
  );
}

export function isInsideGasCloud(zones: BoardZoneObject[], pos: BoardPosition, side: PlayerSide): boolean {
  return zones.some(
    (z) => z.type === 'gas' && z.owner !== side && getChebyshevDistance(z.position, pos) <= 1
  );
}

export function isNearShrine(zones: BoardZoneObject[], pos: BoardPosition, side: PlayerSide): boolean {
  return zones.some(
    (z) => z.type === 'shrine' && z.owner !== side && getChebyshevDistance(z.position, pos) <= 1
  );
}

export function isSporeSquare(zones: BoardZoneObject[], pos: BoardPosition, side: PlayerSide): boolean {
  return zones.some(
    (z) => z.type === 'spore' && z.owner !== side && isSamePos(z.position, pos)
  );
}

export function tickZonesForSide(zones: BoardZoneObject[], activeSide: PlayerSide): BoardZoneObject[] {
  return zones
    .map((z) => {
      if (z.owner === activeSide) {
        return { ...z, durationTurns: z.durationTurns - 1 };
      }
      return z;
    })
    .filter((z) => z.durationTurns > 0);
}
