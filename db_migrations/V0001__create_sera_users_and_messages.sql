
CREATE TABLE t_p87846200_quantum_research_ini.sera_users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  session_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p87846200_quantum_research_ini.sera_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES t_p87846200_quantum_research_ini.sera_users(id),
  receiver_id INTEGER REFERENCES t_p87846200_quantum_research_ini.sera_users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
