import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const SamplingMethodsVisualization = () => {
  const [method, setMethod] = useState('rejection');
  const [samples, setSamples] = useState([]);
  const [target, setTarget] = useState([]);
  
  // Generate a bimodal distribution as target
  useEffect(() => {
    const generateTargetDist = () => {
      const x = d3.range(-3, 3, 0.1);
      
      // Create bimodal distribution (mixture of two normals)
      const y = x.map(val => {
        const dist1 = Math.exp(-Math.pow(val - 1, 2) / 0.5);
        const dist2 = Math.exp(-Math.pow(val + 1, 2) / 0.8);
        return 0.6 * dist1 + 0.4 * dist2;
      });
      
      // Normalize
      const max = Math.max(...y);
      const normalized = y.map(val => val / max);
      
      setTarget(x.map((val, i) => ({ x: val, y: normalized[i] })));
    };
    
    generateTargetDist();
  }, []);
  
  // Generate samples based on selected method
  useEffect(() => {
    if (target.length === 0) return;
    
    const generateSamples = () => {
      const numSamples = 300;
      let newSamples = [];
      
      switch (method) {
        case 'rejection':
          // Rejection sampling
          let count = 0;
          while (newSamples.length < numSamples && count < 5000) {
            count++;
            // Propose from uniform distribution
            const x = (Math.random() * 6) - 3;
            const y = Math.random();
            
            // Get closest target density
            const idx = Math.floor((x + 3) / 0.1);
            if (idx >= 0 && idx < target.length) {
              const targetY = target[idx].y;
              
              // Accept/reject
              if (y < targetY) {
                newSamples.push({ x, y });
              }
            }
          }
          break;
        
        case 'mcmc':
          // Simple Metropolis-Hastings implementation
          let current = (Math.random() * 6) - 3;
          
          for (let i = 0; i < numSamples + 500; i++) {
            // Propose new value with random walk
            const proposed = current + (Math.random() - 0.5) * 0.5;
            
            if (proposed >= -3 && proposed <= 3) {
              // Calculate acceptance probability
              const currentIdx = Math.floor((current + 3) / 0.1);
              const proposedIdx = Math.floor((proposed + 3) / 0.1);
              
              if (currentIdx >= 0 && currentIdx < target.length && 
                  proposedIdx >= 0 && proposedIdx < target.length) {
                
                const currentDensity = target[currentIdx].y;
                const proposedDensity = target[proposedIdx].y;
                
                const acceptanceProb = Math.min(1, proposedDensity / currentDensity);
                
                if (Math.random() < acceptanceProb) {
                  current = proposed;
                }
              }
            }
            
            // Discard burn-in period
            if (i >= 500) {
              const y = Math.random() * 0.1;
              newSamples.push({ x: current, y });
            }
          }
          break;
          
        case 'importance':
          // Importance sampling using a normal distribution as proposal
          for (let i = 0; i < numSamples; i++) {
            // Sample from proposal (normal distribution)
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const x = z * 1.5; // Normal with std=1.5
            
            if (x >= -3 && x <= 3) {
              const y = Math.random() * 0.1;
              // Size of points will represent importance weights
              const idx = Math.floor((x + 3) / 0.1);
              let weight = 1;
              
              if (idx >= 0 && idx < target.length) {
                // Target density
                const targetDensity = target[idx].y;
                // Proposal density (normal with std=1.5)
                const proposalDensity = Math.exp(-Math.pow(x, 2) / (2 * 1.5 * 1.5)) / (1.5 * Math.sqrt(2 * Math.PI));
                // Normalize weight
                weight = targetDensity / (proposalDensity * 4);
              }
              
              newSamples.push({ x, y, weight: Math.min(weight, 5) });
            }
          }
          break;
      }
      
      setSamples(newSamples);
    };
    
    generateSamples();
  }, [method, target]);
  
  // Render the visualization
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Sampling Methods in Machine Learning</h2>
      
      <div className="mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setMethod('rejection')}
            className={`px-3 py-1 rounded ${method === 'rejection' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Rejection Sampling
          </button>
          <button
            onClick={() => setMethod('mcmc')}
            className={`px-3 py-1 rounded ${method === 'mcmc' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            MCMC Sampling
          </button>
          <button
            onClick={() => setMethod('importance')}
            className={`px-3 py-1 rounded ${method === 'importance' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Importance Sampling
          </button>
        </div>
      </div>
      
      <div className="h-64 mb-4 relative">
        <svg width="100%" height="100%" viewBox="0 0 600 300">
          {/* Draw target distribution */}
          <path
            d={`M${target.map((d, i) => `${i === 0 ? 'M' : 'L'}${(d.x + 3) * 50 + 50},${280 - d.y * 250}`).join(' ')}`}
            stroke="steelblue"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Draw samples */}
          {samples.map((d, i) => (
            <circle
              key={i}
              cx={(d.x + 3) * 50 + 50}
              cy={d.y * 250 + 20}
              r={method === 'importance' ? Math.sqrt(d.weight) * 2 : 2}
              fill="red"
              opacity="0.5"
            />
          ))}
          
          {/* X-axis */}
          <line x1="50" y1="280" x2="350" y2="280" stroke="black" />
          {[-3, -2, -1, 0, 1, 2, 3].map((tick, i) => (
            <g key={i}>
              <line
                x1={(tick + 3) * 50 + 50}
                y1="280"
                x2={(tick + 3) * 50 + 50}
                y2="285"
                stroke="black"
              />
              <text
                x={(tick + 3) * 50 + 50}
                y="295"
                textAnchor="middle"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          ))}
          
          {/* Title */}
          <text x="300" y="20" textAnchor="middle" fontWeight="bold">
            {method === 'rejection' ? 'Rejection Sampling' : 
             method === 'mcmc' ? 'MCMC Sampling' : 'Importance Sampling'}
          </text>
          
          {/* Legend */}
          <circle cx="520" cy="30" r="4" fill="red" opacity="0.5" />
          <text x="530" y="35" fontSize="12">Samples</text>
          
          <path d="M500,50 L540,50" stroke="steelblue" strokeWidth="2" />
          <text x="550" y="55" fontSize="12">Target</text>
        </svg>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded">
        {method === 'rejection' && (
          <div>
            <h3 className="font-semibold">Rejection Sampling</h3>
            <p>Samples uniformly from a bounding region and keeps only points under the target density curve.</p>
            <p className="mt-2"><strong>Applications:</strong> Simple to implement but inefficient in high dimensions.</p>
          </div>
        )}
        
        {method === 'mcmc' && (
          <div>
            <h3 className="font-semibold">Markov Chain Monte Carlo (MCMC)</h3>
            <p>Creates a Markov chain that has the target distribution as its equilibrium distribution.</p>
            <p className="mt-2"><strong>Applications:</strong> Bayesian inference, sampling from complex posteriors, variational inference.</p>
          </div>
        )}
        
        {method === 'importance' && (
          <div>
            <h3 className="font-semibold">Importance Sampling</h3>
            <p>Samples from a proposal distribution and reweights samples to match the target distribution.</p>
            <p className="mt-2"><strong>Applications:</strong> Variational inference, reinforcement learning, rare event simulation.</p>
            <p><small>Note: Circle size represents importance weight</small></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplingMethodsVisualization;
