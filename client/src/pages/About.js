import React from 'react';
import './assets/css/about.css';
import { Icon } from '@iconify/react';

const About = () => {
  const team = [
    {
      name: 'Shamsher khan',
      // src: require('./assets/images/Nina.jfif'),
      email: 'creator.shamshe@gmail.com',
      href: 'https://github.com/shamsher0786',
    },
    {
      name: 'MD ZUBAIR',
      // src: require('./assets/images/'),
      email: 'ZubairABC@gmail.com',
      href: 'https://github.com/mdzubairx',
    },
  
  ];

  return (
    <section className="team-main">
      <h1>
        Take your first Carbon <span>Footsteps</span> with us
      </h1>
      <div className="about-info">
        <div className="about-p">
          <div className="about-h3">
            Carbon Footsteppers believe that it is important for all of us to
            reduce our carbon footprints.
          </div>
          <p>
            We are a team of full-stack developers who were inspired to ask “how
            can we lower our carbon emissions?” We looked for carbon footprint
            calculators and intentional steps we could take to reduce our own
            footprints. We couldn’t find a tool that combined self-awareness and
            action in one place. We knew what an effective carbon footprint
            calculator needed to do, so we made it. The entire calculator and
            pledge workflow, each piece of the calculator, each graph, each
            pledge was designed and crafted by our team.
          </p>
          <div className="about-h3">
            We believe that individual positive change can go hand-in-hand with
            education.
          </div>
          <p>
            We know it can be tough to learn about your personal impact on
            climate change. With a little help you can take the first steps to
            reduce and offset your carbon emissions, and feel proud of your
            completed pledges.
          </p>
          <p>
            Contact any member of the team if you have questions about Carbon
            Footsteps and check out our individual GitHub repositories to see
            more of our work.
          </p>
        </div>
      </div>
      <div className="team-info">
        {team.map((teammate) => (
          <div className="team-container" key={teammate.name}>
            <h2>{teammate.name}</h2>
            <img
              src={teammate.src}
              alt={teammate.name}
              style={{ width: 200 }}
            ></img>
            <div className="links-row">
              <div className="links-col">
                <a href="mailto:{teammate.email}">
                  <h3>
                    <Icon icon="clarity:email-line" color="#243B4A" />
                  </h3>
                </a>
              </div>
              <div className="links-col">
                <a
                  href={teammate.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h4>
                    <Icon icon="akar-icons:github-fill" color="#243B4A" />
                  </h4>
                </a>
              </div>
            </div>
            <br />
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
