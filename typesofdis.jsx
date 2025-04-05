import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';
import * as math from 'mathjs';

const DistributionVisualizer = () => {
  const [selectedDistribution, setSelectedDistribution] = useState('normal');
  const [parameters, setParameters] = useState({
    normal: { mean: 0, std: 1 },
    uniform: { min: -3, max: 3 },
    exponential: { lambda: 1 },
    binomial: { n: 10, p: 0.5 },
    poisson: { lambda: 5 }
  });

  // Generate normal distribution data
  const generateNormalData = (mean, std, points = 100) => {
    const data = [];
    const min = mean - 4 * std;
    const max = mean + 4 * std;
    const step = (max - min) / points;
    
    for (let x = min; x <= max; x += step) {
      const y = (1 / (std * Math.sqrt(2 * Math.PI))) * 
                Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
      data.push({ x: x.toFixed(2), y });
    }
    return data;
  };

  // Generate uniform distribution data
  const generateUniformData = (min, max, points = 100) => {
    const data = [];
    const step = (max - min) / points;
    const height = 1 / (max - min);
    
    for (let x = min - 1; x <= max + 1; x += step) {
      const y = (x >= min && x <= max) ? height : 0;
      data.push({ x: x.toFixed(2), y });
    }
    return data;
  };

  // Generate exponential distribution data
  const generateExponentialData = (lambda, points = 100) => {
    const data = [];
    const max = 5 / lambda;
    const step = max / points;
    
    for (let x = 0; x <= max; x += step) {
      const y = lambda * Math.exp(-lambda * x);
      data.push({ x: x.toFixed(2), y });
    }
    return data;
  };

  // Generate binomial distribution data
  const generateBinomialData = (n, p) => {
    const data = [];
    
    for (let k = 0; k <= n; k++) {
      const probability = math.combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      data.push({ x: k, y: probability });
    }
    return data;
  };

  // Generate Poisson distribution data
  const generatePoissonData = (lambda) => {
    const data = [];
    const maxK = Math.min(20, Math.ceil(lambda * 3));
    
    for (let k = 0; k <= maxK; k++) {
      const numerator = Math.pow(lambda, k) * Math.exp(-lambda);
      let denominator = 1;
      for (let i = 2; i <= k; i++) {
        denominator *= i;
      }
      const probability = numerator / denominator;
      data.push({ x: k, y: probability });
    }
    return data;
  };

  const getDistributionData = () => {
    switch (selectedDistribution) {
      case 'normal':
        return generateNormalData(parameters.normal.mean, parameters.normal.std);
      case 'uniform':
        return generateUniformData(parameters.uniform.min, parameters.uniform.max);
      case 'exponential':
        return generateExponentialData(parameters.exponential.lambda);
      case 'binomial':
        return generateBinomialData(parameters.binomial.n, parameters.binomial.p);
      case 'poisson':
        return generatePoissonData(parameters.poisson.lambda);
      default:
        return [];
    }
  };

  const handleParameterChange = (distType, paramName, value) => {
    setParameters({
      ...parameters,
      [distType]: {
        ...parameters[distType],
        [paramName]: parseFloat(value)
      }
    });
  };

  const renderParameters = () => {
    switch (selectedDistribution) {
      case 'normal':
        return (
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Mean (μ):</label>
              <input 
                type="range" 
                min="-5" 
                max="5" 
                step="0.5" 
                value={parameters.normal.mean}
                onChange={(e) => handleParameterChange('normal', 'mean', e.target.value)}
                className="w-full"
              />
              <span>{parameters.normal.mean}</span>
            </div>
            <div>
              <label className="block text-sm font-medium">Standard Deviation (σ):</label>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.1" 
                value={parameters.normal.std}
                onChange={(e) => handleParameterChange('normal', 'std', e.target.value)}
                className="w-full"
              />
              <span>{parameters.normal.std}</span>
            </div>
          </div>
        );
      case 'uniform':
        return (
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Minimum:</label>
              <input 
                type="range" 
                min="-10" 
                max="0" 
                step="0.5" 
                value={parameters.uniform.min}
                onChange={(e) => handleParameterChange('uniform', 'min', e.target.value)}
                className="w-full"
              />
              <span>{parameters.uniform.min}</span>
            </div>
            <div>
              <label className="block text-sm font-medium">Maximum:</label>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="0.5" 
                value={parameters.uniform.max}
                onChange={(e) => handleParameterChange('uniform', 'max', e.target.value)}
                className="w-full"
              />
              <span>{parameters.uniform.max}</span>
            </div>
          </div>
        );
      case 'exponential':
        return (
          <div>
            <label className="block text-sm font-medium">Rate (λ):</label>
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1" 
              value={parameters.exponential.lambda}
              onChange={(e) => handleParameterChange('exponential', 'lambda', e.target.value)}
              className="w-full"
            />
            <span>{parameters.exponential.lambda}</span>
          </div>
        );
      case 'binomial':
        return (
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Trials (n):</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1" 
                value={parameters.binomial.n}
                onChange={(e) => handleParameterChange('binomial', 'n', e.target.value)}
                className="w-full"
              />
              <span>{parameters.binomial.n}</span>
            </div>
            <div>
              <label className="block text-sm font-medium">Success Probability (p):</label>
              <input 
                type="range" 
                min="0.1" 
                max="0.9" 
                step="0.1" 
                value={parameters.binomial.p}
                onChange={(e) => handleParameterChange('binomial', 'p', e.target.value)}
                className="w-full"
              />
              <span>{parameters.binomial.p}</span>
            </div>
          </div>
        );
      case 'poisson':
        return (
          <div>
            <label className="block text-sm font-medium">Rate (λ):</label>
            <input 
              type="range" 
              min="0.5" 
              max="15" 
              step="0.5" 
              value={parameters.poisson.lambda}
              onChange={(e) => handleParameterChange('poisson', 'lambda', e.target.value)}
              className="w-full"
            />
            <span>{parameters.poisson.lambda}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getDistributionInfo = () => {
    switch (selectedDistribution) {
      case 'normal':
        return {
          title: "Normal Distribution",
          formula: "f(x) = (1 / (σ√2π)) * e^(-(x-μ)²/2σ²)",
          parameters: `μ = ${parameters.normal.mean}, σ = ${parameters.normal.std}`,
          description: "The normal distribution is fundamental in statistics and ML. It's symmetric around its mean μ and its spread is determined by standard deviation σ. Many natural phenomena follow this distribution due to the Central Limit Theorem."
        };
      case 'uniform':
        return {
          title: "Uniform Distribution",
          formula: "f(x) = 1/(b-a) for a ≤ x ≤ b",
          parameters: `a = ${parameters.uniform.min}, b = ${parameters.uniform.max}`,
          description: "The uniform distribution represents equal probability across a range. It's often used for initialization in ML algorithms and for generating random numbers for simulations."
        };
      case 'exponential':
        return {
          title: "Exponential Distribution",
          formula: "f(x) = λe^(-λx) for x ≥ 0",
          parameters: `λ = ${parameters.exponential.lambda}`,
          description: "The exponential distribution models the time between events in a Poisson process. It's commonly used in survival analysis, reliability engineering, and modeling waiting times."
        };
      case 'binomial':
        return {
          title: "Binomial Distribution",
          formula: "P(X = k) = (n choose k) * p^k * (1-p)^(n-k)",
          parameters: `n = ${parameters.binomial.n}, p = ${parameters.binomial.p}`,
          description: "The binomial distribution models the number of successes in n independent trials with probability p. It's used in classification problems and hypothesis testing."
        };
      case 'poisson':
        return {
          title: "Poisson Distribution",
          formula: "P(X = k) = (λ^k * e^(-λ)) / k!",
          parameters: `λ = ${parameters.poisson.lambda}`,
          description: "The Poisson distribution models the number of events occurring in a fixed time interval. It's used in rare event analysis, queueing theory, and modeling count data."
        };
      default:
        return { title: "", formula: "", parameters: "", description: "" };
    }
  };

  const info = getDistributionInfo();
  const data = getDistributionData();
  const isDiscrete = ['binomial', 'poisson'].includes(selectedDistribution);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Interactive Probability Distributions</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Distribution:</label>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedDistribution('normal')}
            className={`px-3 py-1 rounded ${selectedDistribution === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Normal
          </button>
          <button 
            onClick={() => setSelectedDistribution('uniform')}
            className={`px-3 py-1 rounded ${selectedDistribution === 'uniform' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Uniform
          </button>
          <button 
            onClick={() => setSelectedDistribution('exponential')}
            className={`px-3 py-1 rounded ${selectedDistribution === 'exponential' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Exponential
          </button>
          <button 
            onClick={() => setSelectedDistribution('binomial')}
            className={`px-3 py-1 rounded ${selectedDistribution === 'binomial' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Binomial
          </button>
          <button 
            onClick={() => setSelectedDistribution('poisson')}
            className={`px-3 py-1 rounded ${selectedDistribution === 'poisson' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Poisson
          </button>
        </div>
      </div>

      <div className="mb-6">
        {renderParameters()}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">{info.title}</h3>
        <div className="mt-1 p-2 bg-gray-100 rounded">
          <p className="font-mono">{info.formula}</p>
          <p className="text-sm mt-1">Parameters: {info.parameters}</p>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          {isDiscrete ? (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="y" fill="#8884d8" name="Probability" />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="y" stroke="#8884d8" name="Probability Density" dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p>{info.description}</p>
      </div>
    </div>
  );
};

export default DistributionVisualizer;
