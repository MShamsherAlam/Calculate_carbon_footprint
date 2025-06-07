import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useQuery, useMutation } from '@apollo/client';
import './pledges.css';

import { QUERY_PLEDGES, QUERY_ME } from '../../utils/queries';
import { ADD_PLEDGE } from '../../utils/mutations';
import { savePledgeIds, getSavedPledgeIds } from '../../utils/localStorage';

const Pledges = () => {
  // get data from pledge query
  const { data } = useQuery(QUERY_PLEDGES);
  // target pledge data for mapping
  const pledges = data?.pledges || [];

  // state for targeting ids to change text of button
  const [savedPledgeIds, setSavedPledgeIds] = useState(getSavedPledgeIds());

  useEffect(() => {
    return () => savePledgeIds(savedPledgeIds);
  });

  // add pledge mutation
  const [addPledge] = useMutation(ADD_PLEDGE, {
    update(cache) {
      try {
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, pledgeData: [...me.pledgeData] } },
        });
      } catch (e) {
        console.warn(e);
      }
    },
  });

  // function to handle saving a pledge to our database
  const handleSavedPledge = async (pledgeId) => {
    // find pledge in the in state by matching id
    const pledgeToSave = pledges.find((pledge) => pledge._id === pledgeId);

    try {
      await addPledge({
        // save to array
        variables: { pledgeData: pledgeId },
      });

      // save ids to local storage to change text on button
      setSavedPledgeIds([...savedPledgeIds, pledgeToSave._id]);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to categorize pledges
  const getPledgeSections = (totalFootprint) => {
    // Example thresholds (in kg CO2) for each category
    if (totalFootprint < 5000) {
      return [
        {
          title: 'Very Low Carbon Footprint: You are a Climate Champion!',
          pledges: [
            {
              action: 'Mentor Others',
              description: 'Mentor others on sustainable living.'
            },
            {
              action: 'Join or Start a Local Environmental Group',
              description: 'Get involved in your community to promote sustainability.'
            },
            {
              action: 'Offset Remaining Emissions',
              description: 'Support reforestation or verified carbon offset projects.'
            }
          ]
        }
      ];
    } else if (totalFootprint < 10000) {
      return [
        {
          title: 'Low Carbon Footprint: Keep it up!',
          pledges: [
            {
              action: 'Advocate for Green Policies',
              description: 'Support and vote for policies and leaders that prioritize sustainability and renewable energy.'
            },
            {
              action: 'Support Local, Sustainable Businesses',
              description: 'Choose to buy from companies with strong environmental values.'
            },
            {
              action: 'Organize a Community Clean-up',
              description: 'Help organize or participate in local clean-up events.'
            }
          ]
        }
      ];
    } else if (totalFootprint < 20000) {
      return [
        {
          title: 'Moderate Carbon Footprint: Room to Improve',
          pledges: [
            {
              action: 'Reduce Meat and Dairy Consumption',
              description: 'Try more plant-based meals each week.'
            },
            {
              action: 'Use Energy-Efficient Appliances',
              description: 'Upgrade to appliances with high energy ratings.'
            },
            {
              action: 'Carpool or Use Public Transport',
              description: 'Reduce solo car trips by sharing rides or using public transit.'
            }
          ]
        }
      ];
    } else if (totalFootprint < 35000) {
      return [
        {
          title: 'High Carbon Footprint: Take Action!',
          pledges: [
            {
              action: 'Switch to Renewable Energy',
              description: 'Reduce your home energy emissions by switching to a green energy provider or installing solar panels.'
            },
            {
              action: 'Replace Short Car Trips',
              description: 'Walk or cycle instead of driving for short distances.'
            },
            {
              action: 'Insulate Your Home',
              description: 'Improve your home\'s insulation to reduce heating and cooling needs.'
            }
          ]
        }
      ];
    } else {
      return [
        {
          title: 'Very High Carbon Footprint: Transform Your Impact!',
          pledges: [
            {
              action: 'Commit to a "No-Fly" Year',
              description: 'Drastically reduce or eliminate air travel for a year.'
            },
            {
              action: 'Invest in Solar Panels or Home Retrofits',
              description: 'Make major upgrades to your home\'s energy systems.'
            },
            {
              action: 'Transition to an Electric Vehicle',
              description: 'Plan to replace your car with an electric vehicle.'
            }
          ]
        }
      ];
    }
  };

  // Calculate total carbon footprint from localStorage or props (default to 0 if not found)
  let totalFootprint = 0;
  try {
    const data = JSON.parse(localStorage.getItem('apollo-cache-persist'));
    const me = data?.ROOT_QUERY?.me;
    if (me && me.homeData && me.travelData) {
      const home = me.homeData[0] || {};
      const travel = me.travelData[0] || {};
      totalFootprint =
        (home.heatEmissions || 0) +
        (home.electricityEmissions || 0) +
        (home.waterEmissions || 0) +
        (travel.vehicleEmissions || 0) +
        (travel.publicTransitEmissions || 0) +
        (travel.planeEmissions || 0);
    }
  } catch (e) {}

  const pledgeSections = getPledgeSections(totalFootprint);

  return (
    <div className="pledge-main">
      <h2>Take action to reduce your carbon footprint!</h2>
      <p className="pledge-info">
        Make pledges to commit to reducing your carbon footprint. View your
        pledges in the My Pledges section and mark them complete when you
        complete that task.
      </p>
      <div className="pledge-data">
        {pledges.map((pledge) => (
          <div className="pledge" key={pledge._id}>
            <h3 className="pledge-title">
              <Icon icon={pledge.icon} color="#243B4A" width="25" height="25" />
              {'  '}
              {pledge.action}
            </h3>
            <p>{pledge.description}</p>
            <a href={pledge.link} target="_blank" rel="noopener noreferrer">
              Learn more about this pledge
            </a>
            <button
              id={pledge._id}
              className="pledge-btn"
              onClick={() => handleSavedPledge(pledge._id)}
            >
              {savedPledgeIds?.some(
                (savedPledgeId) => savedPledgeId === pledge._id
              )
                ? 'Pledge saved!'
                : 'Make This Pledge'}
            </button>
          </div>
        ))}
      </div>
      {/* Custom pledge sections based on carbon footprint */}
      {pledgeSections.map((section, idx) => (
        <div key={idx} className="pledge-section">
          <h3>{section.title}</h3>
          <ul>
            {section.pledges.map((p, i) => (
              <li key={i} style={{marginBottom: '1em'}}>
                <strong>{p.action}:</strong> {p.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Pledges;
