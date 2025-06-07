import React from 'react';
import { Link } from 'react-router-dom';
import Pledges from '../components/Pledges/index.js';
import { Graph } from '../components/Graph';
import { addCommas } from '../utils/helpers.js';
import './assets/css/footprint.css';
import { useQuery } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MyFootprint = () => {
  const { data, loading } = useQuery(QUERY_ME);

  const { username, homeData, travelData } = data?.me || [];

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <div className="footprint">
      {Auth.loggedIn() ? (
        <div>
          <section className="my-footprint">
            <div>
              {homeData.length && travelData.length &&
                homeData[0] && travelData[0] &&
                homeData[0].waterEmissions !== undefined &&
                homeData[0].electricityEmissions !== undefined &&
                homeData[0].heatEmissions !== undefined &&
                travelData[0].vehicleEmissions !== undefined &&
                travelData[0].publicTransitEmissions !== undefined &&
                travelData[0].planeEmissions !== undefined ? (
                <div className="footprint-data">
                  <div className="calculations">
                    <h1 className="footprint-title">
                      {username}'s Carbon Footprint
                    </h1>
                    <p>
                      Water emissions: {addCommas(homeData[0].waterEmissions)}{' '}
                      kg CO2
                    </p>
                    <p>
                      Electricity emissions:{' '}
                      {addCommas(homeData[0].electricityEmissions)} kg CO2
                    </p>
                    <p>
                      Heat emissions: {addCommas(homeData[0].heatEmissions)} kg
                      CO2
                    </p>
                    <p>
                      Vehicle emissions:{' '}
                      {addCommas(travelData[0].vehicleEmissions)} kg CO2
                    </p>
                    <p>
                      Public Transit emissions:{' '}
                      {addCommas(travelData[0].publicTransitEmissions)} kg CO2
                    </p>
                    <p>
                      Plane emissions: {addCommas(travelData[0].planeEmissions)}{' '}
                      kg CO2
                    </p>
                    <p className="total">
                      Your total Carbon Footprint:{' '}
                      {addCommas(
                        homeData[0].heatEmissions +
                          homeData[0].electricityEmissions +
                          homeData[0].waterEmissions +
                          travelData[0].vehicleEmissions +
                          travelData[0].publicTransitEmissions +
                          travelData[0].planeEmissions
                      )}{' '}
                      kg CO2
                    </p>
                    {/* Pie Chart for Emissions Breakdown */}
                    {/* <div style={{margin: '2em 0'}}>
                      <h3>Emissions Breakdown</h3>
                      <PieChart width={400} height={300}>
                        <Pie
                          data={[
                            { name: 'Water', value: homeData[0].waterEmissions },
                            { name: 'Electricity', value: homeData[0].electricityEmissions },
                            { name: 'Heat', value: homeData[0].heatEmissions },
                            { name: 'Vehicle', value: travelData[0].vehicleEmissions },
                            { name: 'Public Transit', value: travelData[0].publicTransitEmissions },
                            { name: 'Plane', value: travelData[0].planeEmissions },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {[
                            { name: 'Water', value: homeData[0].waterEmissions },
                            { name: 'Electricity', value: homeData[0].electricityEmissions },
                            { name: 'Heat', value: homeData[0].heatEmissions },
                            { name: 'Vehicle', value: travelData[0].vehicleEmissions },
                            { name: 'Public Transit', value: travelData[0].publicTransitEmissions },
                            { name: 'Plane', value: travelData[0].planeEmissions },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </div> */}
                    {/* Personalized Suggestions */}
                    <div style={{margin: '2em 0'}}>
                      <h3>Personalized Suggestions</h3>
                      {(() => {
                        const chartData = [
                          { name: 'Water', value: homeData[0].waterEmissions },
                          { name: 'Electricity', value: homeData[0].electricityEmissions },
                          { name: 'Heat', value: homeData[0].heatEmissions },
                          { name: 'Vehicle', value: travelData[0].vehicleEmissions },
                          { name: 'Public Transit', value: travelData[0].publicTransitEmissions },
                          { name: 'Plane', value: travelData[0].planeEmissions },
                        ];
                        const topCategory = chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0]);
                        return (
                          <div>
                            <strong>Your biggest impact area: {topCategory.name}</strong>
                            <p>
                              {topCategory.name === 'Vehicle' && 'Try reducing car travel, carpooling, or switching to public transport.'}
                              {topCategory.name === 'Plane' && 'Try to reduce air travel or offset your flights with verified carbon credits.'}
                              {topCategory.name === 'Electricity' && 'Consider switching to renewable energy or reducing device usage.'}
                              {topCategory.name === 'Heat' && 'Improve your home\'s insulation or reduce heating usage.'}
                              {topCategory.name === 'Water' && 'Reduce shower time, fix leaks, and use water-efficient appliances.'}
                              {topCategory.name === 'Public Transit' && 'Public transit is efficient, but if this is high, consider if trips can be reduced or combined.'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                    {/* India Context Section */}
                    <div style={{margin: '2em 0', background: '#181f2a', color: '#e3f2fd', padding: '1em', borderRadius: '10px'}}>
                      <h3>India Context</h3>
                      <p>
                        <strong>Average Indian carbon footprint:</strong> ~1.9 metric tons CO₂ per person per year (2022).
                        <br />
                        <strong>Your total:</strong> {
                          addCommas(
                            homeData[0].heatEmissions +
                            homeData[0].electricityEmissions +
                            homeData[0].waterEmissions +
                            travelData[0].vehicleEmissions +
                            travelData[0].publicTransitEmissions +
                            travelData[0].planeEmissions
                          )
                        } kg CO₂ per year
                      </p>
                      <ul>
                        <li>Use Indian Railways, Metro, or buses for long-distance travel.</li>
                        <li>Switch to LPG/PNG for cooking instead of coal or wood.</li>
                        <li>Reduce air conditioner use, especially during peak summer months.</li>
                        <li>Support rooftop solar or join local renewable energy programs.</li>
                        <li>Participate in local tree plantation or clean-up drives.</li>
                      </ul>
                      <p style={{fontSize: '0.9em', color: '#bbdefb'}}>Source: <a href="https://ourworldindata.org/co2/country/india" target="_blank" rel="noopener noreferrer" style={{color:'#bbdefb'}}>Our World in Data</a></p>
                    </div>
                  </div>
                  <div className="graph">
                  
                    <Graph graphData={{ homeData, travelData }} />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="no-info-title">
                    You haven't calculated your carbon footprint yet or some data is missing!
                  </h2>
                  <div className="add-btn">
                    <Link to="/calculator">
                      <button>Go to Calculator</button>
                    </Link>
                  </div>
                  <Pledges />
                </div>
              )}
            </div>
          </section>
          <section>
          <h1>jksfdahgfkjahsgdfkj</h1>
            {homeData.length || travelData.length ? <Pledges /> : ''}
            {/* <Pledges /> */}
          </section>
        </div>
      ) : (
        <div className="not-logged-in">
          <h2 className="no-info-title">
            Log in to see your carbon footprint!
          </h2>
          <Link to="/login">
            <button type="submit">Log In</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyFootprint;
