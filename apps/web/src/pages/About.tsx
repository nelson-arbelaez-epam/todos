import Text from '../components/atoms/Text/Text';

const About = () => {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Text variant="heading-1" as="h1">
        About Page
      </Text>
      <Text variant="body">This is the about page of the Todos Web App</Text>
    </section>
  );
};

export default About;
