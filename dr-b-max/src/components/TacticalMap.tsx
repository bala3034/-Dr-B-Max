"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaUserNinja, FaSignal } from "react-icons/fa";

// Fix Leaflet's default icon path issues with Next.js
const friendIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mock Data for nearby P2P friends (Redwood National Forest coords)
const mockFriends = [
  { id: '1', name: 'Node Charlie', lat: 41.214, lng: -124.006, status: 'Strong', lastSeen: 'Just now' },
  { id: '2', name: 'Sarah\'s Phone', lat: 41.212, lng: -124.002, status: 'Weak', lastSeen: '2 mins ago' },
  { id: '3', name: 'Basecamp', lat: 41.210, lng: -124.005, status: 'Dropped', lastSeen: '45 mins ago' }
];

export default function TacticalMap() {
  const [center] = useState<[number, number]>([41.213181, -124.004623]);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        {/* Real OpenStreetMap Tiles - In a real PWA, these are cached offline up to 1GB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-filter"
        />

        {/* User Location Radar Pulse */}
        <Circle 
          center={center} 
          pathOptions={{ color: '#39ff14', fillColor: '#39ff14', fillOpacity: 0.2 }} 
          radius={200} // 200 meter bubble
        />
        
        {/* User Pin */}
        <Circle 
          center={center} 
          pathOptions={{ color: '#ffffff', fillColor: '#39ff14', fillOpacity: 1 }} 
          radius={20}
        />

        {/* Render Friends (Mesh Nodes) */}
        {mockFriends.map(friend => (
          <React.Fragment key={friend.id}>
            <Marker position={[friend.lat, friend.lng]} icon={friendIcon}>
              <Popup>
                <div className="font-bold text-[#1a1c1c]">{friend.name}</div>
                <div className="text-sm text-gray-500">Signal: {friend.status}</div>
                <div className="text-sm text-gray-400 border-t mt-2 pt-2">Last ping: {friend.lastSeen}</div>
              </Popup>
            </Marker>
            
            {/* If signal dropped, show breadcrumb circle instead of active pulse */}
            <Circle 
              center={[friend.lat, friend.lng]} 
              pathOptions={{ 
                color: friend.status === 'Dropped' ? '#ff3131' : '#b4cbce',
                dashArray: friend.status === 'Dropped' ? '4' : '0'
              }} 
              radius={friend.status === 'Strong' ? 50 : 20} 
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
