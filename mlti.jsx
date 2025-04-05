import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MultivariateNormalVisualization = () => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Set up SVG
    const width = 400;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
      
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([-3, 3])
      .range([0, innerWidth]);
      
    const yScale = d3.scaleLinear()
      .domain([-3, 3])
      .range([innerHeight, 0]);
    
    // Create contour data for bivariate normal
    const n = 50;
    const x = d3.range(-3, 3, 6 / n);
    const y = d3.range(-3, 3, 6 / n);
    const z = new Array(n * n);
    
    // Parameters for bivariate normal
    const mu1 = 0, mu2 = 0;
    const sigma1 = 1, sigma2 = 1;
    const rho = 0.7;  // Correlation coefficient
    
    // Calculate density for bivariate normal
    let i = 0;
    for (let yi = 0; yi < n; ++yi) {
      for (let xi = 0; xi < n; ++xi) {
        const x_val = x[xi];
        const y_val = y[yi];
        
        // Formula for bivariate normal pdf
        const term1 = 1 / (2 * Math.PI * sigma1 * sigma2 * Math.sqrt(1 - rho * rho));
        const term2 = -1 / (2 * (1 - rho * rho));
        const term3 = Math.pow((x_val - mu1) / sigma1, 2);
        const term4 = Math.pow((y_val - mu2) / sigma2, 2);
        const term5 = 2 * rho * ((x_val - mu1) / sigma1) * ((y_val - mu2) / sigma2);
        
        z[i] = term1 * Math.exp(term2 * (term3 + term4 - term5));
        i++;
      }
    }
    
    // Generate contours
    const contours = d3.contourDensity()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .size([innerWidth, innerHeight])
      .bandwidth(30)
      .thresholds(15)
      (Array.from({ length: 2000 }, () => {
        // Box-Muller transform for generating normal samples
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        
        const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const z2 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        
        // Apply correlation
        const x1 = z1 * sigma1 + mu1;
        const x2 = z1 * rho * sigma2 + z2 * Math.sqrt(1 - rho * rho) * sigma2 + mu2;
        
        return [x1, x2];
      }));
    
    // Add contour paths
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("stroke-width", (d, i) => i % 5 ? 0.25 : 1)
      .attr("d", d3.geoPath());
    
    // Add colored contour fills
    g.append("g")
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("fill", d => d3.interpolateBlues(d.value * 20))
      .attr("d", d3.geoPath());
    
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    g.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("X₁");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("X₂");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Bivariate Normal Distribution (ρ = 0.7)");
      
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef}></svg>
      <div className="mt-4 p-3 bg-blue-50 rounded max-w-lg">
        <p><strong>Multivariate Normal Distribution</strong> generalizes the normal distribution to higher dimensions. 
        The visualization shows a bivariate normal with correlation ρ = 0.7.</p>
        <p className="mt-2">Key properties:</p>
        <ul className="list-disc pl-5">
          <li>Completely described by mean vector and covariance matrix</li>
          <li>Elliptical contours of equal density</li>
          <li>Marginal and conditional distributions are also normal</li>
          <li>Fundamental in many ML algorithms</li>
        </ul>
      </div>
    </div>
  );
};

export default MultivariateNormalVisualization;
