import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Ring, Torus } from '@react-three/drei'
import * as THREE from 'three'

function CoreSphere({ isListening }) {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5
      meshRef.current.rotation.z = Math.sin(time * 0.3) * 0.1
      
      // Pulse effect when listening
      if (isListening) {
        const scale = 1 + Math.sin(time * 5) * 0.1
        meshRef.current.scale.setScalar(scale)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
    
    if (glowRef.current) {
      glowRef.current.rotation.y = -time * 0.3
      const glowScale = 1.2 + Math.sin(time * 2) * 0.05
      glowRef.current.scale.setScalar(glowScale)
    }
  })

  return (
    <group>
      {/* Outer Glow */}
      <Sphere ref={glowRef} args={[1.3, 32, 32]}>
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Core Sphere */}
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={isListening ? 2 : 1}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Inner Energy */}
      <Sphere args={[0.7, 32, 32]}>
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
        />
      </Sphere>
    </group>
  )
}

function EnergyRings({ isListening }) {
  const ringsRef = useRef()
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (ringsRef.current) {
      ringsRef.current.rotation.x = time * 0.5
      ringsRef.current.rotation.y = time * 0.3
      ringsRef.current.rotation.z = time * 0.2
    }
  })

  const rings = useMemo(() => {
    return [1.5, 1.8, 2.1, 2.4, 2.7].map((radius, i) => (
      <Torus
        key={i}
        args={[radius, 0.02, 16, 100]}
        rotation={[Math.PI / 2 + i * 0.2, i * 0.3, i * 0.1]}
      >
        <meshStandardMaterial
          color="#00d9ff"
          emissive="#00d9ff"
          emissiveIntensity={isListening ? 1.5 : 0.8}
          transparent
          opacity={0.6 - i * 0.1}
        />
      </Torus>
    ))
  }, [isListening])

  return <group ref={ringsRef}>{rings}</group>
}

function ParticleField() {
  const particlesRef = useRef()
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 2
      const radius = 3 + Math.random() * 2
      
      temp.push({
        position: [
          radius * Math.sin(theta) * Math.cos(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(theta)
        ]
      })
    }
    return temp
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.05
    }
  })

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial
            color="#00d9ff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function ArcReactor({ isListening }) {
  return (
    <div className="relative w-full max-w-md aspect-square">
      {/* Outer Ring Decoration */}
      <div className="absolute inset-0 rounded-full border-2 border-jarvis-blue/30 animate-pulse-ring" />
      <div className="absolute inset-4 rounded-full border border-jarvis-blue/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="rounded-full"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d9ff" />
        
        <CoreSphere isListening={isListening} />
        <EnergyRings isListening={isListening} />
        <ParticleField />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-jarvis-blue/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-jarvis-blue/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-jarvis-blue/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-jarvis-blue/50" />

      {/* Status Text */}
      {isListening && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-jarvis-blue text-sm font-semibold animate-pulse">
          LISTENING...
        </div>
      )}
    </div>
  )
}

export default ArcReactor
