import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Core glowing center
function CoreGlow({ isListening }) {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.z = time * 0.3
      
      if (isListening) {
        const scale = 1 + Math.sin(time * 8) * 0.15
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.z = -time * 0.5
      const intensity = isListening ? 2 + Math.sin(time * 4) * 0.5 : 1.5
      glowRef.current.material.emissiveIntensity = intensity
    }
  })

  return (
    <group>
      {/* Outer glow ring */}
      <mesh ref={glowRef} position={[0, 0, -0.1]}>
        <ringGeometry args={[0.8, 1.2, 64]} />
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00d9ff"
          emissiveIntensity={isListening ? 3 : 2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Concentric rings in center */}
      {[0.5, 0.6, 0.7].map((radius, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.02, 64]} />
          <meshStandardMaterial
            color="#00d9ff"
            emissive="#00d9ff"
            emissiveIntensity={2 - i * 0.3}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Triangular blue panels (like in Iron Man)
function TriangularPanels({ isListening }) {
  const groupRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.1
    }
  })

  const panels = useMemo(() => {
    const panelCount = 12
    const radius = 1.8
    const panels = []

    for (let i = 0; i < panelCount; i++) {
      const angle = (i / panelCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      panels.push({
        position: [x, y, -0.2],
        rotation: [0, 0, angle + Math.PI / 2]
      })
    }
    return panels
  }, [])

  return (
    <group ref={groupRef}>
      {panels.map((panel, i) => (
        <group key={i} position={panel.position} rotation={panel.rotation}>
          {/* Triangular panel */}
          <mesh>
            <boxGeometry args={[0.4, 0.15, 0.1]} />
            <meshStandardMaterial
              color="#0099cc"
              emissive="#00d9ff"
              emissiveIntensity={isListening ? 1.2 : 0.8}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Glow effect */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[0.42, 0.17, 0.05]} />
            <meshBasicMaterial
              color="#00d9ff"
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Copper/Gold coil segments
function CoilSegments() {
  const groupRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = -time * 0.15
    }
  })

  const coils = useMemo(() => {
    const coilCount = 8
    const radius = 2.2
    const coils = []

    for (let i = 0; i < coilCount; i++) {
      const angle = (i / coilCount) * Math.PI * 2 + Math.PI / 8
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      coils.push({
        position: [x, y, -0.15],
        rotation: [0, 0, angle + Math.PI / 2]
      })
    }
    return coils
  }, [])

  return (
    <group ref={groupRef}>
      {coils.map((coil, i) => (
        <group key={i} position={coil.position} rotation={coil.rotation}>
          {/* Copper coil */}
          <mesh>
            <boxGeometry args={[0.35, 0.25, 0.15]} />
            <meshStandardMaterial
              color="#cd7f32"
              emissive="#ff8800"
              emissiveIntensity={0.3}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          {/* Coil details - horizontal lines */}
          {[0, 0.08, -0.08].map((offset, j) => (
            <mesh key={j} position={[0, offset, 0.08]}>
              <boxGeometry args={[0.36, 0.02, 0.02]} />
              <meshStandardMaterial
                color="#8b4513"
                metalness={1}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// Outer ring structure with slots
function OuterRingStructure() {
  const ringRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.05
    }
  })

  const slots = useMemo(() => {
    const slotCount = 24
    const radius = 2.6
    const slots = []

    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      slots.push({
        position: [x, y, -0.1],
        rotation: [0, 0, angle]
      })
    }
    return slots
  }, [])

  return (
    <group ref={ringRef}>
      {/* Main ring */}
      <mesh>
        <ringGeometry args={[2.4, 2.7, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#00d9ff"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.4}
        />
      </mesh>

      {/* Slots/segments */}
      {slots.map((slot, i) => (
        <mesh key={i} position={slot.position} rotation={slot.rotation}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
          <meshStandardMaterial
            color="#0d0d1a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Energy particles
function EnergyParticles({ isListening }) {
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 2
      const radius = 1 + Math.random() * 2
      
      temp.push({
        position: [
          radius * Math.sin(theta) * Math.cos(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(theta) * 0.3
        ],
        scale: Math.random() * 0.02 + 0.01
      })
    }
    return temp
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (particlesRef.current) {
      particlesRef.current.rotation.z = time * 0.1
      particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.1
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.scale, 8, 8]} />
          <meshBasicMaterial
            color="#00d9ff"
            transparent
            opacity={isListening ? 0.8 : 0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

function ArcReactorV2({ isListening }) {
  return (
    <div className="relative w-full max-w-lg aspect-square">
      {/* Outer decorative rings */}
      <div className="absolute inset-0 rounded-full border-2 border-jarvis-blue/20 animate-pulse-ring" />
      <div className="absolute inset-2 rounded-full border border-jarvis-blue/30 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      <div className="absolute inset-4 rounded-full border border-jarvis-blue/20 animate-pulse-ring" style={{ animationDelay: '1s' }} />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        className="rounded-full"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#00d9ff" />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#00d9ff" />
        
        <CoreGlow isListening={isListening} />
        <TriangularPanels isListening={isListening} />
        <CoilSegments />
        <OuterRingStructure />
        <EnergyParticles isListening={isListening} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Corner brackets - Iron Man HUD style */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-jarvis-blue/60" />
      <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-jarvis-blue/60" />
      <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-jarvis-blue/60" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-jarvis-blue/60" />

      {/* Status indicators */}
      {isListening && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-jarvis-blue animate-pulse">
            <div className="w-2 h-2 rounded-full bg-jarvis-blue animate-ping" />
            <span className="text-sm font-semibold uppercase tracking-wider">LISTENING</span>
            <div className="w-2 h-2 rounded-full bg-jarvis-blue animate-ping" />
          </div>
        </div>
      )}

      {/* Power level indicator */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-jarvis-blue text-xs font-mono opacity-70">
          POWER LEVEL: {isListening ? '100%' : '85%'}
        </div>
      </div>
    </div>
  )
}

export default ArcReactorV2
