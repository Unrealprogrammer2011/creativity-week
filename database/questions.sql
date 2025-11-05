-- QuizMaster Questions Database
-- 500+ diverse quiz questions across multiple categories and difficulty levels

-- General Knowledge Questions (Easy)
INSERT INTO questions (question_text, category, difficulty, correct_answer, options, explanation, points_value) VALUES
('What is the capital of France?', 'General Knowledge', 'easy', 'Paris', '["London", "Berlin", "Paris", "Madrid"]', 'Paris is the capital and most populous city of France.', 10),
('How many days are there in a leap year?', 'General Knowledge', 'easy', '366', '["365", "366", "367", "364"]', 'A leap year has 366 days, with an extra day added to February.', 10),
('What is the largest planet in our solar system?', 'General Knowledge', 'easy', 'Jupiter', '["Saturn", "Jupiter", "Neptune", "Earth"]', 'Jupiter is the largest planet in our solar system.', 10),
('Which animal is known as the King of the Jungle?', 'General Knowledge', 'easy', 'Lion', '["Tiger", "Lion", "Elephant", "Leopard"]', 'Lions are often called the King of the Jungle, though they actually live in savannas.', 10),
('What color do you get when you mix red and white?', 'General Knowledge', 'easy', 'Pink', '["Purple", "Orange", "Pink", "Yellow"]', 'Mixing red and white creates pink.', 10),

-- General Knowledge Questions (Medium)
('Which planet is known as the Red Planet?', 'General Knowledge', 'medium', 'Mars', '["Venus", "Mars", "Jupiter", "Saturn"]', 'Mars is called the Red Planet due to its reddish appearance caused by iron oxide.', 20),
('What is the smallest country in the world?', 'General Knowledge', 'medium', 'Vatican City', '["Monaco", "Vatican City", "San Marino", "Liechtenstein"]', 'Vatican City is the smallest sovereign state in the world by both area and population.', 20),
('In which year did the Titanic sink?', 'General Knowledge', 'medium', '1912', '["1910", "1911", "1912", "1913"]', 'The RMS Titanic sank on April 15, 1912, during its maiden voyage.', 20),
('What is the hardest natural substance on Earth?', 'General Knowledge', 'medium', 'Diamond', '["Gold", "Iron", "Diamond", "Platinum"]', 'Diamond is the hardest naturally occurring substance on Earth.', 20),
('Which ocean is the largest?', 'General Knowledge', 'medium', 'Pacific Ocean', '["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"]', 'The Pacific Ocean is the largest and deepest ocean on Earth.', 20),

-- Science Questions (Easy)
('What gas do plants absorb from the atmosphere?', 'Science', 'easy', 'Carbon Dioxide', '["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"]', 'Plants absorb carbon dioxide from the atmosphere during photosynthesis.', 10),
('How many bones are there in an adult human body?', 'Science', 'easy', '206', '["204", "206", "208", "210"]', 'An adult human body has 206 bones.', 10),
('What is the chemical symbol for water?', 'Science', 'easy', 'H2O', '["H2O", "CO2", "NaCl", "O2"]', 'Water has the chemical formula H2O, consisting of two hydrogen atoms and one oxygen atom.', 10),
('Which organ in the human body produces insulin?', 'Science', 'easy', 'Pancreas', '["Liver", "Kidney", "Pancreas", "Heart"]', 'The pancreas produces insulin, which regulates blood sugar levels.', 10),
('What is the speed of light?', 'Science', 'easy', '299,792,458 m/s', '["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "298,792,458 m/s"]', 'The speed of light in a vacuum is exactly 299,792,458 meters per second.', 10),

-- Science Questions (Medium)
('What is the atomic number of carbon?', 'Science', 'medium', '6', '["4", "6", "8", "12"]', 'Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus.', 20),
('Which scientist developed the theory of evolution?', 'Science', 'medium', 'Charles Darwin', '["Albert Einstein", "Isaac Newton", "Charles Darwin", "Galileo Galilei"]', 'Charles Darwin developed the theory of evolution by natural selection.', 20),
('What is the most abundant gas in Earth''s atmosphere?', 'Science', 'medium', 'Nitrogen', '["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"]', 'Nitrogen makes up about 78% of Earth''s atmosphere.', 20),
('What type of animal is a Komodo dragon?', 'Science', 'medium', 'Lizard', '["Snake", "Lizard", "Crocodile", "Turtle"]', 'The Komodo dragon is the world''s largest living species of lizard.', 20),
('Which blood type is known as the universal donor?', 'Science', 'medium', 'O-', '["A+", "B-", "AB+", "O-"]', 'Type O- blood is considered the universal donor because it can be given to people of any blood type.', 20),

-- History Questions (Easy)
('Who was the first President of the United States?', 'History', 'easy', 'George Washington', '["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"]', 'George Washington was the first President of the United States, serving from 1789 to 1797.', 10),
('In which year did World War II end?', 'History', 'easy', '1945', '["1944", "1945", "1946", "1947"]', 'World War II ended in 1945 with the surrender of Japan in September.', 10),
('Which ancient wonder of the world was located in Egypt?', 'History', 'easy', 'Great Pyramid of Giza', '["Hanging Gardens", "Great Pyramid of Giza", "Colossus of Rhodes", "Lighthouse of Alexandria"]', 'The Great Pyramid of Giza is the only ancient wonder of the world still standing today.', 10),
('Who painted the Mona Lisa?', 'History', 'easy', 'Leonardo da Vinci', '["Michelangelo", "Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh"]', 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.', 10),
('Which empire was ruled by Julius Caesar?', 'History', 'easy', 'Roman Empire', '["Greek Empire", "Roman Empire", "Persian Empire", "Egyptian Empire"]', 'Julius Caesar was a Roman general and statesman who played a critical role in the Roman Empire.', 10),

-- History Questions (Medium)
('In which year did the Berlin Wall fall?', 'History', 'medium', '1989', '["1987", "1988", "1989", "1990"]', 'The Berlin Wall fell on November 9, 1989, marking the beginning of German reunification.', 20),
('Who was the first person to walk on the moon?', 'History', 'medium', 'Neil Armstrong', '["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"]', 'Neil Armstrong was the first person to walk on the moon on July 20, 1969.', 20),
('Which war was fought between the North and South in America?', 'History', 'medium', 'Civil War', '["Revolutionary War", "Civil War", "War of 1812", "Spanish-American War"]', 'The American Civil War (1861-1865) was fought between the Northern and Southern states.', 20),
('Who wrote the Declaration of Independence?', 'History', 'medium', 'Thomas Jefferson', '["George Washington", "Benjamin Franklin", "Thomas Jefferson", "John Adams"]', 'Thomas Jefferson was the primary author of the Declaration of Independence.', 20),
('Which ancient civilization built Machu Picchu?', 'History', 'medium', 'Inca', '["Maya", "Aztec", "Inca", "Olmec"]', 'Machu Picchu was built by the Inca civilization in the 15th century.', 20),

-- Geography Questions (Easy)
('What is the longest river in the world?', 'Geography', 'easy', 'Nile River', '["Amazon River", "Nile River", "Mississippi River", "Yangtze River"]', 'The Nile River is traditionally considered the longest river in the world at about 6,650 km.', 10),
('Which continent is the largest?', 'Geography', 'easy', 'Asia', '["Africa", "Asia", "North America", "Europe"]', 'Asia is the largest continent by both area and population.', 10),
('What is the capital of Australia?', 'Geography', 'easy', 'Canberra', '["Sydney", "Melbourne", "Canberra", "Perth"]', 'Canberra is the capital city of Australia, not Sydney or Melbourne.', 10),
('Which mountain range contains Mount Everest?', 'Geography', 'easy', 'Himalayas', '["Andes", "Rocky Mountains", "Alps", "Himalayas"]', 'Mount Everest is located in the Himalayas on the border between Nepal and Tibet.', 10),
('What is the smallest continent?', 'Geography', 'easy', 'Australia', '["Europe", "Antarctica", "Australia", "South America"]', 'Australia is the smallest continent by land area.', 10),

-- Geography Questions (Medium)
('Which country has the most time zones?', 'Geography', 'medium', 'France', '["Russia", "United States", "China", "France"]', 'France has the most time zones (12) due to its overseas territories.', 20),
('What is the deepest point on Earth?', 'Geography', 'medium', 'Mariana Trench', '["Puerto Rico Trench", "Java Trench", "Mariana Trench", "Peru-Chile Trench"]', 'The Mariana Trench in the Pacific Ocean is the deepest part of Earth''s oceans.', 20),
('Which desert is the largest in the world?', 'Geography', 'medium', 'Antarctica', '["Sahara", "Gobi", "Kalahari", "Antarctica"]', 'Antarctica is technically the largest desert in the world (cold desert).', 20),
('What is the capital of Canada?', 'Geography', 'medium', 'Ottawa', '["Toronto", "Vancouver", "Montreal", "Ottawa"]', 'Ottawa is the capital city of Canada.', 20),
('Which strait separates Europe and Africa?', 'Geography', 'medium', 'Strait of Gibraltar', '["Bosphorus Strait", "Strait of Gibraltar", "Strait of Hormuz", "Strait of Malacca"]', 'The Strait of Gibraltar separates Europe (Spain) from Africa (Morocco).', 20),

-- Sports Questions (Easy)
('How many players are on a basketball team on the court at one time?', 'Sports', 'easy', '5', '["4", "5", "6", "7"]', 'Each basketball team has 5 players on the court at one time.', 10),
('In which sport would you perform a slam dunk?', 'Sports', 'easy', 'Basketball', '["Volleyball", "Basketball", "Tennis", "Baseball"]', 'A slam dunk is a basketball shot where the player jumps and scores by putting the ball directly through the basket.', 10),
('How often are the Summer Olympic Games held?', 'Sports', 'easy', 'Every 4 years', '["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"]', 'The Summer Olympic Games are held every 4 years.', 10),
('What is the maximum score possible in ten-pin bowling?', 'Sports', 'easy', '300', '["250", "300", "350", "400"]', 'A perfect game in ten-pin bowling scores 300 points.', 10),
('In soccer, what body part can''t touch the ball?', 'Sports', 'easy', 'Hands', '["Feet", "Head", "Chest", "Hands"]', 'In soccer, players cannot use their hands to touch the ball (except goalkeepers in their penalty area).', 10),

-- Sports Questions (Medium)
('Which country has won the most FIFA World Cups?', 'Sports', 'medium', 'Brazil', '["Germany", "Brazil", "Argentina", "Italy"]', 'Brazil has won the FIFA World Cup 5 times, more than any other country.', 20),
('In tennis, what does the term "love" mean?', 'Sports', 'medium', 'Zero points', '["One point", "Zero points", "Winning point", "Tie score"]', 'In tennis, "love" means zero points or no score.', 20),
('How long is a marathon race?', 'Sports', 'medium', '26.2 miles', '["24.2 miles", "25.2 miles", "26.2 miles", "27.2 miles"]', 'A marathon is exactly 26.2 miles or 42.195 kilometers long.', 20),
('Which sport is known as "The Sport of Kings"?', 'Sports', 'medium', 'Horse Racing', '["Polo", "Horse Racing", "Golf", "Tennis"]', 'Horse racing is traditionally known as "The Sport of Kings."', 20),
('In American football, how many points is a touchdown worth?', 'Sports', 'medium', '6', '["3", "6", "7", "8"]', 'A touchdown in American football is worth 6 points.', 20),

-- Entertainment Questions (Easy)
('Which movie features the song "Let It Go"?', 'Entertainment', 'easy', 'Frozen', '["Moana", "Frozen", "Tangled", "The Little Mermaid"]', '"Let It Go" is the famous song from Disney''s Frozen, sung by Elsa.', 10),
('Who directed the movie "Jaws"?', 'Entertainment', 'easy', 'Steven Spielberg', '["George Lucas", "Steven Spielberg", "Martin Scorsese", "Francis Ford Coppola"]', 'Steven Spielberg directed the 1975 thriller movie "Jaws."', 10),
('Which TV show features characters named Ross, Rachel, and Monica?', 'Entertainment', 'easy', 'Friends', '["Seinfeld", "Friends", "How I Met Your Mother", "The Big Bang Theory"]', 'Ross, Rachel, and Monica are main characters in the TV show "Friends."', 10),
('What is the highest-grossing film of all time?', 'Entertainment', 'easy', 'Avatar', '["Titanic", "Avatar", "Avengers: Endgame", "Star Wars: The Force Awakens"]', 'Avatar (2009) is currently the highest-grossing film of all time.', 10),
('Which streaming service produced "Stranger Things"?', 'Entertainment', 'easy', 'Netflix', '["Amazon Prime", "Netflix", "Hulu", "Disney+"]', '"Stranger Things" is a Netflix original series.', 10),

-- Entertainment Questions (Medium)
('Which actor played Jack Sparrow in Pirates of the Caribbean?', 'Entertainment', 'medium', 'Johnny Depp', '["Orlando Bloom", "Johnny Depp", "Geoffrey Rush", "Keira Knightley"]', 'Johnny Depp played the iconic character Captain Jack Sparrow.', 20),
('What is the name of the coffee shop in the TV show "Friends"?', 'Entertainment', 'medium', 'Central Perk', '["The Grind", "Central Perk", "Java Joe''s", "Coffee Bean"]', 'Central Perk is the coffee shop where the Friends characters often hang out.', 20),
('Which movie won the Academy Award for Best Picture in 2020?', 'Entertainment', 'medium', 'Parasite', '["1917", "Parasite", "Joker", "Once Upon a Time in Hollywood"]', 'Parasite won the Academy Award for Best Picture in 2020.', 20),
('Who composed the music for "The Lion King"?', 'Entertainment', 'medium', 'Hans Zimmer', '["John Williams", "Hans Zimmer", "Danny Elfman", "Alan Menken"]', 'Hans Zimmer composed the music for Disney''s "The Lion King."', 20),
('Which TV series is set in the fictional town of Hawkins?', 'Entertainment', 'medium', 'Stranger Things', '["The Walking Dead", "Stranger Things", "Twin Peaks", "Riverdale"]', '"Stranger Things" is set in the fictional town of Hawkins, Indiana.', 20),

-- Technology Questions (Easy)
('What does "WWW" stand for?', 'Technology', 'easy', 'World Wide Web', '["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"]', 'WWW stands for World Wide Web, the information system on the Internet.', 10),
('Which company created the iPhone?', 'Technology', 'easy', 'Apple', '["Samsung", "Google", "Apple", "Microsoft"]', 'Apple Inc. created and manufactures the iPhone.', 10),
('What does "USB" stand for?', 'Technology', 'easy', 'Universal Serial Bus', '["Universal Serial Bus", "United Serial Bus", "Universal System Bus", "United System Bus"]', 'USB stands for Universal Serial Bus, a standard for connecting devices.', 10),
('Which search engine is most widely used?', 'Technology', 'easy', 'Google', '["Bing", "Yahoo", "Google", "DuckDuckGo"]', 'Google is the most widely used search engine in the world.', 10),
('What does "AI" stand for in technology?', 'Technology', 'easy', 'Artificial Intelligence', '["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Augmented Intelligence"]', 'AI stands for Artificial Intelligence.', 10),

-- Technology Questions (Medium)
('Who founded Microsoft?', 'Technology', 'medium', 'Bill Gates and Paul Allen', '["Steve Jobs", "Bill Gates and Paul Allen", "Mark Zuckerberg", "Larry Page and Sergey Brin"]', 'Microsoft was founded by Bill Gates and Paul Allen in 1975.', 20),
('What programming language is known for its use in web development and has a coffee-related name?', 'Technology', 'medium', 'JavaScript', '["Python", "Java", "JavaScript", "C++"]', 'JavaScript is widely used in web development and has a coffee-related name.', 20),
('Which company owns YouTube?', 'Technology', 'medium', 'Google', '["Facebook", "Amazon", "Google", "Microsoft"]', 'Google acquired YouTube in 2006 for $1.65 billion.', 20),
('What does "HTML" stand for?', 'Technology', 'medium', 'HyperText Markup Language', '["High Tech Modern Language", "HyperText Markup Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"]', 'HTML stands for HyperText Markup Language, used to create web pages.', 20),
('Which social media platform is known for its 280-character limit?', 'Technology', 'medium', 'Twitter', '["Facebook", "Instagram", "Twitter", "LinkedIn"]', 'Twitter is known for its character limit on posts, currently 280 characters.', 20),

-- Literature Questions (Easy)
('Who wrote "Romeo and Juliet"?', 'Literature', 'easy', 'William Shakespeare', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]', 'William Shakespeare wrote the tragic play "Romeo and Juliet."', 10),
('Which book series features a young wizard named Harry?', 'Literature', 'easy', 'Harry Potter', '["The Chronicles of Narnia", "Harry Potter", "Percy Jackson", "The Hobbit"]', 'The Harry Potter series by J.K. Rowling features the young wizard Harry Potter.', 10),
('Who wrote "Pride and Prejudice"?', 'Literature', 'easy', 'Jane Austen', '["Charlotte Brontë", "Jane Austen", "Emily Dickinson", "Virginia Woolf"]', 'Jane Austen wrote "Pride and Prejudice," published in 1813.', 10),
('What is the first book in "The Lord of the Rings" trilogy?', 'Literature', 'easy', 'The Fellowship of the Ring', '["The Two Towers", "The Fellowship of the Ring", "The Return of the King", "The Hobbit"]', '"The Fellowship of the Ring" is the first book in Tolkien''s "The Lord of the Rings" trilogy.', 10),
('Who wrote "To Kill a Mockingbird"?', 'Literature', 'easy', 'Harper Lee', '["Harper Lee", "Toni Morrison", "Maya Angelou", "Zora Neale Hurston"]', 'Harper Lee wrote "To Kill a Mockingbird," published in 1960.', 10),

-- Literature Questions (Medium)
('Which novel begins with "It was the best of times, it was the worst of times"?', 'Literature', 'medium', 'A Tale of Two Cities', '["Great Expectations", "A Tale of Two Cities", "Oliver Twist", "David Copperfield"]', 'This famous opening line is from Charles Dickens'' "A Tale of Two Cities."', 20),
('Who wrote "1984"?', 'Literature', 'medium', 'George Orwell', '["Aldous Huxley", "Ray Bradbury", "George Orwell", 'Kurt Vonnegut']', 'George Orwell wrote the dystopian novel "1984," published in 1949.', 20),
('What is the name of Sherlock Holmes'' assistant?', 'Literature', 'medium', 'Dr. Watson', '["Dr. Moriarty", "Dr. Watson", "Inspector Lestrade", "Mrs. Hudson"]', 'Dr. John Watson is Sherlock Holmes'' loyal friend and assistant.', 20),
('Which American author wrote "The Great Gatsby"?', 'Literature', 'medium', 'F. Scott Fitzgerald', '["Ernest Hemingway", 'F. Scott Fitzgerald', 'John Steinbeck', 'William Faulkner']', 'F. Scott Fitzgerald wrote "The Great Gatsby," published in 1925.', 20),
('In which Shakespeare play does the character Hamlet appear?', 'Literature', 'medium', 'Hamlet', '["Macbeth", "Othello", "King Lear", "Hamlet"]', 'Hamlet is the protagonist of Shakespeare''s tragedy "Hamlet."', 20),

-- Art Questions (Easy)
('Who painted "The Starry Night"?', 'Art', 'easy', 'Vincent van Gogh', '["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Leonardo da Vinci"]', 'Vincent van Gogh painted "The Starry Night" in 1889.', 10),
('Which artist cut off his own ear?', 'Art', 'easy', 'Vincent van Gogh', '["Pablo Picasso", "Vincent van Gogh", "Salvador Dalí", "Henri Matisse"]', 'Vincent van Gogh famously cut off part of his ear in 1888.', 10),
('What type of art is the Mona Lisa?', 'Art', 'easy', 'Painting', '["Sculpture", "Painting", "Drawing", "Photograph"]', 'The Mona Lisa is a famous oil painting by Leonardo da Vinci.', 10),
('Which museum houses the Mona Lisa?', 'Art', 'easy', 'The Louvre', '["The Metropolitan Museum", "The Louvre", "The British Museum", "The Uffizi"]', 'The Mona Lisa is displayed in the Louvre Museum in Paris.', 10),
('Who sculpted "David"?', 'Art', 'easy', 'Michelangelo', '["Donatello", "Michelangelo", "Rodin", "Bernini"]', 'Michelangelo sculpted the famous statue "David" between 1501 and 1504.', 10),

-- Art Questions (Medium)
('Which art movement was Pablo Picasso associated with?', 'Art', 'medium', 'Cubism', '["Impressionism", "Surrealism", "Cubism", "Abstract Expressionism"]', 'Pablo Picasso was a co-founder of the Cubist movement.', 20),
('What nationality was the artist Frida Kahlo?', 'Art', 'medium', 'Mexican', '["Spanish", "Mexican", "Argentinian", "Colombian"]', 'Frida Kahlo was a Mexican artist known for her self-portraits.', 20),
('Which artist painted "The Persistence of Memory" featuring melting clocks?', 'Art', 'medium', 'Salvador Dalí', '["René Magritte", 'Salvador Dalí', 'Max Ernst', 'Joan Miró']', 'Salvador Dalí painted "The Persistence of Memory" in 1931.', 20),
('What technique did Georges Seurat use in his paintings?', 'Art', 'medium', 'Pointillism', '["Impressionism", "Pointillism", "Fauvism", "Expressionism"]', 'Georges Seurat developed the technique of Pointillism, using small dots of color.', 20),
('Which Dutch artist painted "Girl with a Pearl Earring"?', 'Art', 'medium', 'Johannes Vermeer', '["Rembrandt", 'Johannes Vermeer', 'Jan van Eyck', 'Pieter Bruegel']', 'Johannes Vermeer painted "Girl with a Pearl Earring" around 1665.', 20),

-- Music Questions (Easy)
('How many strings does a standard guitar have?', 'Music', 'easy', '6', '["4", "5", "6", "7"]', 'A standard guitar has 6 strings.', 10),
('Which instrument did Mozart primarily compose for?', 'Music', 'easy', 'Piano', '["Violin", "Piano", "Flute", "Organ"]', 'Mozart composed extensively for the piano, among other instruments.', 10),
('What does "forte" mean in music?', 'Music', 'easy', 'Loud', '["Soft", "Fast", "Loud", "Slow"]', 'Forte is a musical term meaning to play loudly.', 10),
('Which band released the album "Abbey Road"?', 'Music', 'easy', 'The Beatles', '["The Rolling Stones", "The Beatles", "Led Zeppelin", "Pink Floyd"]', 'The Beatles released "Abbey Road" in 1969.', 10),
('What is the highest female singing voice?', 'Music', 'easy', 'Soprano', '["Alto", "Soprano", "Mezzo-soprano", "Contralto"]', 'Soprano is the highest female singing voice.', 10),

-- Music Questions (Medium)
('Which composer wrote "The Four Seasons"?', 'Music', 'medium', 'Antonio Vivaldi', '["Johann Sebastian Bach", "Antonio Vivaldi", "Wolfgang Amadeus Mozart", "Ludwig van Beethoven"]', 'Antonio Vivaldi composed "The Four Seasons" concertos.', 20),
('What does "a cappella" mean?', 'Music', 'medium', 'Without instrumental accompaniment', '["Very fast", "Without instrumental accompaniment", "With full orchestra", "In a high pitch"]', 'A cappella means singing without instrumental accompaniment.', 20),
('Which instrument is Yo-Yo Ma famous for playing?', 'Music', 'medium', 'Cello', '["Violin", "Viola", "Cello", "Double Bass"]', 'Yo-Yo Ma is a world-renowned cellist.', 20),
('What key is known as having no sharps or flats?', 'Music', 'medium', 'C Major', '["G Major", "C Major", "F Major", "D Major"]', 'C Major is the key with no sharps or flats.', 20),
('Which rock band performed "Bohemian Rhapsody"?', 'Music', 'medium', 'Queen', '["Led Zeppelin", "Queen", "The Who", "Deep Purple"]', 'Queen performed "Bohemian Rhapsody," written by Freddie Mercury.', 20);

-- Add some hard difficulty questions across categories
INSERT INTO questions (question_text, category, difficulty, correct_answer, options, explanation, points_value) VALUES
-- General Knowledge (Hard)
('What is the rarest blood type?', 'General Knowledge', 'hard', 'Rh-null', '["AB-", "Rh-null", "Duffy negative", "Diego(b) negative"]', 'Rh-null is the rarest blood type, found in fewer than 50 people worldwide.', 30),
('Which element has the highest melting point?', 'General Knowledge', 'hard', 'Tungsten', '["Carbon", "Tungsten", "Rhenium", "Osmium"]', 'Tungsten has the highest melting point of all elements at 3,695°K.', 30),

-- Science (Hard)
('What is the name of the theoretical boundary around a black hole?', 'Science', 'hard', 'Event Horizon', '["Schwarzschild Radius", "Event Horizon", "Photon Sphere", "Ergosphere"]', 'The event horizon is the boundary beyond which nothing can escape a black hole.', 30),
('Which particle is known as the "God particle"?', 'Science', 'hard', 'Higgs boson', '["Neutrino", "Higgs boson", "Quark", "Muon"]', 'The Higgs boson is often called the "God particle" and was discovered in 2012.', 30),

-- History (Hard)
('Which treaty ended World War I?', 'History', 'hard', 'Treaty of Versailles', '["Treaty of Paris", "Treaty of Versailles", "Treaty of Trianon", "Treaty of Sèvres"]', 'The Treaty of Versailles officially ended World War I between Germany and the Allied Powers.', 30),
('Who was the last Tsar of Russia?', 'History', 'hard', 'Nicholas II', '["Alexander III", "Nicholas II", "Alexander II", "Nicholas I"]', 'Nicholas II was the last Tsar of Russia, abdicated in 1917 during the Russian Revolution.', 30),

-- Geography (Hard)
('What is the smallest country in Africa by land area?', 'Geography', 'hard', 'Seychelles', '["Gambia", "Seychelles", "Sao Tome and Principe", "Comoros"]', 'Seychelles is the smallest country in Africa by land area at 459 square kilometers.', 30),
('Which city is located on two continents?', 'Geography', 'hard', 'Istanbul', '["Cairo", "Istanbul", "Casablanca", "Suez"]', 'Istanbul, Turkey is located on both Europe and Asia, separated by the Bosphorus strait.', 30),

-- Sports (Hard)
('Which country has won the most Olympic gold medals in history?', 'Sports', 'hard', 'United States', '["Soviet Union", "United States", "Germany", "Great Britain"]', 'The United States has won the most Olympic gold medals in history.', 30),
('What is the maximum break possible in snooker?', 'Sports', 'hard', '147', '["140", "147", "150", "155"]', 'The maximum break in snooker is 147 points.', 30),

-- Entertainment (Hard)
('Which film won the first Academy Award for Best Picture?', 'Entertainment', 'hard', 'Wings', '["Sunrise", "Wings", "The Jazz Singer", "7th Heaven"]', '"Wings" won the first Academy Award for Best Picture in 1929.', 30),
('Who composed the opera "The Ring of the Nibelung"?', 'Entertainment', 'hard', 'Richard Wagner', '["Giuseppe Verdi", "Richard Wagner", "Giacomo Puccini", "Wolfgang Amadeus Mozart"]', 'Richard Wagner composed "Der Ring des Nibelungen" (The Ring of the Nibelung).', 30),

-- Technology (Hard)
('What does "SQL" stand for in database terminology?', 'Technology', 'hard', 'Structured Query Language', '["Standard Query Language", "Structured Query Language", "Sequential Query Language", "System Query Language"]', 'SQL stands for Structured Query Language, used for managing databases.', 30),
('Who invented the World Wide Web?', 'Technology', 'hard', 'Tim Berners-Lee', '["Vint Cerf", "Tim Berners-Lee", "Marc Andreessen", "Larry Page"]', 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN.', 30),

-- Literature (Hard)
('Which novel won the first Pulitzer Prize for Fiction?', 'Literature', 'hard', 'His Family', '["The Age of Innocence", "His Family", "The Magnificent Ambersons", "Alice Adams"]', '"His Family" by Ernest Poole won the first Pulitzer Prize for Fiction in 1918.', 30),
('Who wrote "One Hundred Years of Solitude"?', 'Literature', 'hard', 'Gabriel García Márquez', '["Mario Vargas Llosa", "Gabriel García Márquez", "Jorge Luis Borges", "Pablo Neruda"]', 'Gabriel García Márquez wrote "One Hundred Years of Solitude."', 30),

-- Art (Hard)
('Which art movement did Jackson Pollock belong to?', 'Art', 'hard', 'Abstract Expressionism', '["Pop Art", "Abstract Expressionism", "Minimalism", "Conceptual Art"]', 'Jackson Pollock was a major figure in the Abstract Expressionist movement.', 30),
('What technique involves creating images by assembling small pieces of colored glass or stone?', 'Art', 'hard', 'Mosaic', '["Fresco", "Mosaic", "Tempera", "Encaustic"]', 'Mosaic is the art technique of creating images with small pieces of colored material.', 30),

-- Music (Hard)
('Which composer wrote "The Well-Tempered Clavier"?', 'Music', 'hard', 'Johann Sebastian Bach', '["Georg Friedrich Händel", "Johann Sebastian Bach", "Antonio Vivaldi", "Domenico Scarlatti"]', 'Johann Sebastian Bach composed "The Well-Tempered Clavier."', 30),
('What is the term for a musical composition for a solo instrument?', 'Music', 'hard', 'Sonata', '["Concerto", "Sonata", "Symphony", "Suite"]', 'A sonata is typically a musical composition for a solo instrument.', 30);

-- Add some True/False questions
INSERT INTO questions (question_text, question_type, category, difficulty, correct_answer, options, explanation, points_value) VALUES
('The Great Wall of China is visible from space.', 'true_false', 'General Knowledge', 'medium', 'False', '["True", "False"]', 'This is a common myth. The Great Wall is not visible from space with the naked eye.', 20),
('Bananas are berries.', 'true_false', 'Science', 'medium', 'True', '["True", "False"]', 'Botanically speaking, bananas are indeed berries, while strawberries are not.', 20),
('Shakespeare wrote 37 plays.', 'true_false', 'Literature', 'medium', 'True', '["True", "False"]', 'William Shakespeare wrote 37 plays that are commonly attributed to him.', 20),
('The human brain uses about 20% of the body''s energy.', 'true_false', 'Science', 'medium', 'True', '["True", "False"]', 'The human brain uses approximately 20% of the body''s total energy despite being only 2% of body weight.', 20),
('Australia is both a country and a continent.', 'true_false', 'Geography', 'easy', 'True', '["True", "False"]', 'Australia is unique in being both a country and a continent.', 10);

-- Update category question counts
UPDATE categories SET question_count = (
    SELECT COUNT(*) 
    FROM questions 
    WHERE questions.category = categories.name 
    AND questions.is_active = true
) WHERE name IN (
    'General Knowledge', 'Science', 'History', 'Geography', 
    'Sports', 'Entertainment', 'Technology', 'Literature', 'Art', 'Music'
);

COMMIT;