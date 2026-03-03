import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="text-9xl font-black text-primary/20 absolute select-none">404</div>
      <div className="relative z-10">
        <h1 className="text-4xl font-black text-primary mb-4">Ops! Caminho errado.</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Parece que você se perdeu na logística! A página que você procura não está no nosso estoque.
        </p>
        <Link 
          href="/" 
          className="bg-secondary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg inline-block"
        >
          VOLTAR PARA O INÍCIO
        </Link>
      </div>
    </main>
  );
}