import Image from 'next/image';

interface RecipeCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  author?: {
    username: string;
    avatarUrl: string;
  };
  ingredients?: string[];
  instructions?: string[];
}

export default function RecipeCard({ title, description, imageUrl, author, ingredients, instructions }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {imageUrl && (
        <div className="relative h-64">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-4">{description}</p>}
        {ingredients && (
          <div className="mb-2">
            <h3 className="font-semibold">Ingredients:</h3>
            <ul className="list-disc list-inside">
              {ingredients.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
        )}
        {instructions && (
          <div className="mb-2">
            <h3 className="font-semibold">Instructions:</h3>
            <ol className="list-decimal list-inside">
              {instructions.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
          </div>
        )}
        {author && (
          <div className="flex items-center space-x-2 mt-4">
            <Image
              src={author.avatarUrl}
              alt={author.username}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-600">@{author.username}</span>
          </div>
        )}
      </div>
    </div>
  );
} 