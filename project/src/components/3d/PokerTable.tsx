import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function TableModel() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 0.2, 64]} />
        <meshStandardMaterial color="#1a472a" roughness={0.3} metalness={0.1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]}>
        <cylinderGeometry args={[3, 3, 0.01, 64]} />
        <meshStandardMaterial color="#0d291a" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[3.6, 3.6, 0.3, 64]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

interface CardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  suit?: string;
  rank?: string;
  faceDown?: boolean;
}

function Card({ position, rotation = [0, 0, 0], suit = 'H', rank = 'A', faceDown = false }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.02]} />
        <meshStandardMaterial color={faceDown ? '#1e3a8a' : '#ffffff'} roughness={0.2} />
      </mesh>
      {!faceDown && (
        <>
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.3, 0.45]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </>
      )}
    </group>
  );
}

interface ChipProps {
  position: [number, number, number];
  color?: string;
  value?: number;
}

function Chip({ position, color = '#FFD700', value = 100 }: ChipProps) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

interface PlayerSeatProps {
  position: [number, number, number];
  seatNumber: number;
  isOccupied?: boolean;
  isDealer?: boolean;
}

function PlayerSeat({ position, seatNumber, isOccupied = false, isDealer = false }: PlayerSeatProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={isOccupied ? '#4a90e2' : '#666666'}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {isDealer && (
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      )}

      {isOccupied && (
        <>
          <Card position={[-0.2, 0.01, -0.4]} rotation={[-Math.PI / 2, 0, 0]} faceDown />
          <Card position={[0.2, 0.01, -0.4]} rotation={[-Math.PI / 2, 0, 0]} faceDown />
        </>
      )}
    </group>
  );
}

function CommunityCards() {
  return (
    <group position={[0, 0.01, 0]}>
      <Card position={[-1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} suit="H" rank="A" />
      <Card position={[-0.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} suit="D" rank="K" />
      <Card position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} suit="S" rank="Q" />
      <Card position={[0.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} faceDown />
      <Card position={[1, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} faceDown />
    </group>
  );
}

function PotChips() {
  return (
    <group position={[0, 0.01, -1]}>
      <Chip position={[0, 0, 0]} color="#FFD700" />
      <Chip position={[0.1, 0.05, 0.1]} color="#FF0000" />
      <Chip position={[-0.1, 0.05, 0.1]} color="#0000FF" />
      <Chip position={[0, 0.1, 0]} color="#00FF00" />
    </group>
  );
}

interface PokerTable3DProps {
  seats?: Array<{ occupied: boolean; isDealer: boolean }>;
  showCommunityCards?: boolean;
}

export function PokerTable3D({ seats = [], showCommunityCards = true }: PokerTable3DProps) {
  const seatPositions: [number, number, number][] = [
    [0, 0, -3.2],
    [2.8, 0, -1.6],
    [2.8, 0, 1.6],
    [0, 0, 3.2],
    [-2.8, 0, 1.6],
    [-2.8, 0, -1.6],
  ];

  return (
    <Canvas
      shadows
      camera={{ position: [0, 8, 8], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0a0f1a']} />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      <TableModel />

      {seatPositions.map((pos, index) => (
        <PlayerSeat
          key={index}
          position={pos}
          seatNumber={index}
          isOccupied={seats[index]?.occupied || false}
          isDealer={seats[index]?.isDealer || false}
        />
      ))}

      {showCommunityCards && <CommunityCards />}
      <PotChips />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a1628" roughness={0.8} />
      </mesh>

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />

      <Environment preset="night" />
    </Canvas>
  );
}
