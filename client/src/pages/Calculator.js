import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './assets/css/calculator.css';

import Select from '@mui/material/Select';
import { FormControl, InputLabel, MenuItem, Slider } from '@mui/material';

import { useMutation } from '@apollo/client';
import { ADD_TRAVEL, ADD_HOME } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries';
import { Box } from '@mui/system';
import Auth from '../utils/auth';

const Calculator = () => {
  // set state of user form
  const [formState, setFormState] = useState({
    carType: 'SUV',
    carMiles: 1000,
    busMiles: 0,
    trainMiles: 0,
    planeMiles: 0,
    showerNumber: 8,
    minutes: 10,
    laundry: 10,
    flushes: 5,
    bottles: 14,
    fridge: 'Yes',
    TV: 4,
    laptop: 2,
    desktop: 8,
    monitor: 6,
    climate: 'Warm',
    size: 2000,
    acDays: 150,
    gasDays: 150,
    oilDays: 0,
  });
  let {
    carType,
    carMiles,
    busMiles,
    trainMiles,
    planeMiles,
    showerNumber,
    minutes,
    laundry,
    flushes,
    bottles,
    fridge,
    TV,
    laptop,
    desktop,
    monitor,
    size,
    climate,
    acDays,
    gasDays,
    oilDays,
  } = formState;

  // navigate to new page
  const navigate = useNavigate();

  // set useMutation to populate meQuery for both ADD_TRAVEL and ADD_HOME
  const [addTravel] = useMutation(ADD_TRAVEL, {
    update(cache) {
      try {
        // update me array's cache
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, travelData: [...me.travelData] } },
        });
      } catch (e) {
        console.warn(e);
      }
    },
  });
  const [addHome] = useMutation(ADD_HOME, {
    update(cache) {
      try {
        // update me array's cache
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, homeData: [...me.homeData] } },
        });
      } catch (e) {
        console.warn(e);
      }
    },
  });

  // function to calculate home and travel data
  const calculateFootprint = async (
    carType,
    carMiles,
    trainMiles,
    busMiles,
    planeMiles,
    showerNumber,
    minutes,
    laundry,
    flushes,
    bottles,
    fridge,
    TV,
    laptop,
    desktop,
    monitor,
    size,
    climate,
    acDays,
    gasDays,
    oilDays
  ) => {
    let vehicleEmissions;
    switch (carType) {
      case 'Small':
        // vehicleEmissions = Math.round(4.2887(carMiles));
        vehicleEmissions = Math.round(4.2887 * carMiles);
        break;
      case 'Average':
        vehicleEmissions = Math.round(5.32155 * carMiles);
        break;
      case 'Hybrid':
        vehicleEmissions = Math.round(2.9597 * carMiles);
        break;
      default:
        vehicleEmissions = Math.round(7.40532 * carMiles);
        break;
    }

    const publicTransitEmissions = Math.round(
      1.832934 * trainMiles + 3.952283 * busMiles
    );

    const planeEmissions = Math.round(4.678333 * planeMiles);

    const showerEmissions = 78 * showerNumber * minutes;
    const laundryEmissions = 170 * laundry;
    const flushesEmissions = 582.4 * flushes;
    const bottlesEmissions = 161.98 * bottles;
    const waterEmissions = Math.round(
      showerEmissions + laundryEmissions + flushesEmissions + bottlesEmissions
    );

    let fridgeEmissions;
    if (fridge === 'No') {
      fridgeEmissions = 0;
    } else {
      fridgeEmissions = 495;
    }

    const TVEmissions = 14.8272 * TV;
    const desktopEmissions = 29.01095 * desktop;
    const laptopEmissions = 7.73625 * laptop;
    const monitorEmissions = 4.512814 * monitor;

    let ACEmissions, gasEmissions, oilEmissions;
    switch (climate) {
      case 'cold':
        ACEmissions = 0 * size * acDays;
        gasEmissions = ((0.07644 * size) / 365) * gasDays;
        oilEmissions = ((32.68055 * size) / 365) * oilDays;
        break;
      case 'cool':
        ACEmissions = 0.0125 * size * acDays;
        gasEmissions = ((0.0637 * size) / 365) * gasDays;
        oilEmissions = ((26.68412 * size) / 365) * oilDays;
        break;
      case 'moderate':
        ACEmissions = 0.0252 * size * acDays;
        gasEmissions = ((0.05733 * size) / 365) * gasDays;
        oilEmissions = ((20.68769 * size) / 365) * oilDays;
        break;
      case 'warm':
        ACEmissions = 0.0504 * size * acDays;
        gasEmissions = ((0.05096 * size) / 365) * gasDays;
        oilEmissions = ((13.9919 * size) / 365) * oilDays;
        break;
      default:
        ACEmissions = 0.06301 * size * acDays;
        gasEmissions = ((0.0446 * size) / 365) * gasDays;
        oilEmissions = ((8.09518 * size) / 365) * oilDays;
        break;
    }

    const electricityEmissions = Math.round(
      fridgeEmissions +
        TVEmissions +
        desktopEmissions +
        laptopEmissions +
        monitorEmissions +
        ACEmissions
    );

    const heatEmissions = Math.round(gasEmissions + oilEmissions);

    try {
      await addTravel({
        variables: { vehicleEmissions, publicTransitEmissions, planeEmissions },
      });
      await addHome({
        variables: { waterEmissions, electricityEmissions, heatEmissions },
      });
      navigate('/myfootprint');
    } catch (err) {
      console.error(err);
    }
  };

  // function to handle the change of state for the form
  function handleChange(event) {
    setFormState({ ...formState, [event.target.name]: event.target.value });
  }

  // form handler to submit to calculation functions
  function handleSubmit(event) {
    event.preventDefault();
    calculateFootprint(
      carType,
      carMiles,
      busMiles,
      trainMiles,
      planeMiles,
      showerNumber,
      minutes,
      laundry,
      flushes,
      bottles,
      fridge,
      TV,
      laptop,
      desktop,
      monitor,
      size,
      climate,
      acDays,
      gasDays,
      oilDays
    );
  }

  return (
    <div>
      {Auth.loggedIn() ? (
        <main className="calculator-main">
          <h1>Carbon Footprint Calculator</h1>
          <div className="text">
            <div className="description">
              <div className="calc-h3">
                Fill out your individual travel and home information and click
                Find My Footprint.
              </div>
              <p>
                Default values are the averages for an adult in the United
                States. Enter values for your personal carbon footprint, not
                your entire household.
              </p>
              <p>
                This is a simplified carbon footprint calculator using the most
                common, significant factors. There are many factors that
                contribute to your total carbon footprint, like diet and
                shopping habits, that are not taken into consideration.
              </p>
            </div>
          </div>
          <section className="slider-sections">
            <form onSubmit={handleSubmit}>
              <div className="calculator">
                <div className="travel">
                  <h2>My Travel</h2>
                  <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="car-type">Car Type</InputLabel>
                    <Select
                      sx={{
                        color: '#243b4a',
                        margin: '0 0 15px 0',
                      }}
                      labelId="car-type"
                      id="carType"
                      name="carType"
                      defaultValue={carType}
                      value={carType}
                      onChange={handleChange}
                      className="dropdown"
                    >
                      <MenuItem value={'Small'}>Small</MenuItem>
                      <MenuItem value={'Average'}>Average</MenuItem>
                      <MenuItem value={'SUV'}>SUV</MenuItem>
                      <MenuItem value={'Hybrid'}>Hybrid</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label className="slider" title="Miles you drive your car per month. More miles means higher emissions.">🚗 Car Miles Per Month</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Car Miles"
                      defaultValue={1000}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="carMiles"
                      step={500}
                      marks
                      min={0}
                      max={3000}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: carMiles > 2000 ? 'red' : carMiles > 500 ? 'orange' : 'green'}}>
                      {carMiles > 2000 ? 'High mileage' : carMiles > 500 ? 'Average mileage' : 'Low mileage'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🚌 Bus Miles Per Month</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Bus Miles"
                      defaultValue={0}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="busMiles"
                      step={500}
                      marks
                      min={0}
                      max={3000}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: busMiles > 2000 ? 'red' : busMiles > 500 ? 'orange' : 'green'}}>
                      {busMiles > 2000 ? 'High bus usage' : busMiles > 500 ? 'Average bus usage' : 'Low bus usage'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🚆 Train Miles Per Month</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Train Miles"
                      defaultValue={0}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="trainMiles"
                      step={50}
                      marks
                      min={0}
                      max={1000}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: trainMiles > 700 ? 'red' : trainMiles > 200 ? 'orange' : 'green'}}>
                      {trainMiles > 700 ? 'High train usage' : trainMiles > 200 ? 'Average train usage' : 'Low train usage'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>✈️ Plane Miles Per Month</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Plane Miles"
                      defaultValue={0}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="planeMiles"
                      step={100}
                      marks
                      min={0}
                      max={4000}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: planeMiles > 2000 ? 'red' : planeMiles > 500 ? 'orange' : 'green'}}>
                      {planeMiles > 2000 ? 'High air travel' : planeMiles > 500 ? 'Average air travel' : 'Low air travel'}
                    </div>
                  </Box>
                </div>

                <div className="home1">
                  <h2>My Home</h2>
                  <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="fridgeLabel">Fridge</InputLabel>
                    <Select
                      sx={{
                        color: '#243b4a',
                        margin: '0 0 15px 0',
                      }}
                      labelId="fridgeLabel"
                      id="fridge"
                      name="fridge"
                      defaultValue={fridge}
                      value={fridge}
                      onChange={handleChange}
                      className="dropdown"
                    >
                      <MenuItem value={'Yes'}>Yes</MenuItem>
                      <MenuItem value={'No'}>No</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="climate">Climate</InputLabel>
                    <Select
                      sx={{
                        color: '#243b4a',
                        margin: '0 0 15px 0',
                      }}
                      labelId="climateLabel"
                      id="climate"
                      name="climate"
                      defaultValue={climate}
                      value={climate}
                      onChange={handleChange}
                      className="dropdown"
                    >
                      <MenuItem value={'Warm'}>Warm</MenuItem>
                      <MenuItem value={'Moderate'}>Moderate</MenuItem>
                      <MenuItem value={'Cool'}>Cool</MenuItem>
                      <MenuItem value={'Cold'}>Cold</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🚿 Number of Showers Per Week</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Number of Showers"
                      defaultValue={8}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="showerNumber"
                      step={4}
                      marks
                      min={0}
                      max={24}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: showerNumber > 14 ? 'red' : showerNumber > 7 ? 'orange' : 'green'}}>
                      {showerNumber > 14 ? 'High frequency' : showerNumber > 7 ? 'Average frequency' : 'Low frequency'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>⏱️ Time spent in the Shower (Minutes)</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Time spent in Shower"
                      defaultValue={10}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="minutes"
                      step={10}
                      marks
                      min={0}
                      max={120}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: minutes > 30 ? 'red' : minutes > 10 ? 'orange' : 'green'}}>
                      {minutes > 30 ? 'Long showers' : minutes > 10 ? 'Average showers' : 'Short showers'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🧺 Loads of Laundry Per Month</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Loads of Laundry"
                      defaultValue={10}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="laundry"
                      step={5}
                      marks
                      min={0}
                      max={60}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: laundry > 30 ? 'red' : laundry > 10 ? 'orange' : 'green'}}>
                      {laundry > 30 ? 'High laundry' : laundry > 10 ? 'Average laundry' : 'Low laundry'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🚽 Number of Flushes Per Day</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Flushes"
                      defaultValue={5}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="flushes"
                      step={1}
                      marks
                      min={0}
                      max={10}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: flushes > 7 ? 'red' : flushes > 3 ? 'orange' : 'green'}}>
                      {flushes > 7 ? 'High flushes' : flushes > 3 ? 'Average flushes' : 'Low flushes'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🚰 Bottles of Water From the Sink Per Week</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Bottles of Water"
                      defaultValue={14}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="bottles"
                      step={1}
                      marks
                      min={0}
                      max={21}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: bottles > 14 ? 'red' : bottles > 7 ? 'orange' : 'green'}}>
                      {bottles > 14 ? 'High usage' : bottles > 7 ? 'Average usage' : 'Low usage'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>💻 Hours of Laptop Use (Plugged In) Per Day</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Hours of Laptop"
                      defaultValue={2}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="laptop"
                      step={1}
                      marks
                      min={0}
                      max={24}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: laptop > 8 ? 'red' : laptop > 2 ? 'orange' : 'green'}}>
                      {laptop > 8 ? 'High laptop use' : laptop > 2 ? 'Average laptop use' : 'Low laptop use'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🖥️ Hours of Desktop Use Per Day</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Hours of Desktop"
                      defaultValue={8}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="desktop"
                      step={4}
                      marks
                      min={0}
                      max={16}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: desktop > 8 ? 'red' : desktop > 2 ? 'orange' : 'green'}}>
                      {desktop > 8 ? 'High desktop use' : desktop > 2 ? 'Average desktop use' : 'Low desktop use'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🖥️ Hours of Monitor Use Per Day</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Hours of Monitor"
                      defaultValue={6}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="monitor"
                      step={3}
                      marks
                      min={0}
                      max={12}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: monitor > 8 ? 'red' : monitor > 2 ? 'orange' : 'green'}}>
                      {monitor > 8 ? 'High monitor use' : monitor > 2 ? 'Average monitor use' : 'Low monitor use'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🏠 Square Feet of Your Residence</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Square Feet"
                      defaultValue={2000}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="size"
                      step={500}
                      marks
                      min={0}
                      max={8000}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: size > 4000 ? 'red' : size > 1500 ? 'orange' : 'green'}}>
                      {size > 4000 ? 'Large home' : size > 1500 ? 'Average home' : 'Small home'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>❄️ Days You Run Your A/C (at Full Blast)</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="AC Days"
                      defaultValue={150}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="acDays"
                      step={5}
                      marks
                      min={0}
                      max={365}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: acDays > 200 ? 'red' : acDays > 60 ? 'orange' : 'green'}}>
                      {acDays > 200 ? 'High A/C use' : acDays > 60 ? 'Average A/C use' : 'Low A/C use'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🔥 Days You Run Your Heat (Natural Gas, at Full Blast)</label>
                    <Slider
                      sx={{
                        color: '#2C82B3',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: '#2C82B3',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Gas Days"
                      defaultValue={150}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="gasDays"
                      step={5}
                      marks
                      min={0}
                      max={365}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: gasDays > 200 ? 'red' : gasDays > 60 ? 'orange' : 'green'}}>
                      {gasDays > 200 ? 'High heating' : gasDays > 60 ? 'Average heating' : 'Low heating'}
                    </div>
                  </Box>

                  <Box sx={{ m: 1, width: 300 }}>
                    <label>🛢️ Days You Run Your Heat (Oil, at Full Blast)</label>
                    <Slider
                      sx={{
                        color: 'green',
                        margin: '40px 0 15px 0',
                        '& .MuiSlider-valueLabel': {
                          borderRadius: '15px',
                          backgroundColor: 'green',
                        },
                        '& .MuiSlider-rail': {
                          padding: '5px',
                        },
                      }}
                      aria-label="Oil Days"
                      defaultValue={0}
                      onChange={handleChange}
                      valueLabelDisplay="on"
                      name="oilDays"
                      step={5}
                      marks
                      min={0}
                      max={365}
                    ></Slider>
                    <div style={{fontSize: '0.9em', color: oilDays > 200 ? 'red' : oilDays > 60 ? 'orange' : 'green'}}>
                      {oilDays > 200 ? 'High oil heating' : oilDays > 60 ? 'Average oil heating' : 'Low oil heating'}
                    </div>
                  </Box>
                </div>
              </div>
              <div className="calculator-btn">
                <button type="submit">Find My Footprint</button>
              </div>
            </form>
          </section>
        </main>
      ) : (
        <div className="not-logged-in">
          <h2 className="no-info-title">
            Log in to use our carbon footprint calculator!
          </h2>
          <Link to="/login">
            <button type="submit">Log In</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Calculator;
