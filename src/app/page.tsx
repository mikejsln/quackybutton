import RecipeCard from './components/RecipeCard';
import Layout from './components/Layout';
import RecipeExtractor from './components/RecipeExtractor';
import Link from "next/link";

const sampleRecipes = [
  {
    title: "Delicious Pasta Carbonara",
    description: "A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
    imageUrl: "/recipes/carbonara.jpg",
    author: {
      username: "chef_mike",
      avatarUrl: "/avatars/chef_mike.jpg"
    }
  },
  {
    title: "Homemade Pizza Margherita",
    description: "Simple yet delicious pizza with fresh tomatoes, mozzarella, and basil.",
    imageUrl: "/recipes/pizza.jpg",
    author: {
      username: "pizza_master",
      avatarUrl: "/avatars/pizza_master.jpg"
    }
  },
  {
    title: "Chocolate Lava Cake",
    description: "Decadent chocolate cake with a molten center, served warm with vanilla ice cream.",
    imageUrl: "/recipes/lava-cake.jpg",
    author: {
      username: "sweet_tooth",
      avatarUrl: "/avatars/sweet_tooth.jpg"
    }
  }
];

export default function Home() {
  return (
    <Layout>
      <RecipeExtractor />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleRecipes.map((recipe, index) => (
          <RecipeCard key={index} {...recipe} />
        ))}
      </div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/clicker" style={{
          display: "inline-block",
          padding: "12px 32px",
          background: "#ffeb3b",
          color: "#333",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 20,
          textDecoration: "none",
          boxShadow: "0 2px 8px #1976d2"
        }}>
          Play Duck Clicker!
        </Link>
      </div>
    </Layout>
  );
}
