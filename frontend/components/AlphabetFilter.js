import { useState } from 'react';
import Link from 'next/link';

import classNames from '@/functions/classNames';

export default function AlphabetFilter({ items }) {
  const [selectedLetter, setSelectedLetter] = useState();

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleClick = (letter) => {
    setSelectedLetter(letter);
  };

  const filteredItems = selectedLetter
    ? items.filter((item) => item.name[0].toUpperCase() === selectedLetter)
    : items;

  console.log(filteredItems);

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl justify-between p-8 grid grid-cols-5 gap-y-4">
        {filteredItems.map((item, index) => (
          <div
            key={`genre-${item.slug}`}
            className={`${index % 10 === 0 ? 'col-start-1' : ''}`}
          >
            <Link
              href={`/genre/${item.slug}`}
              className="text-gray-700 hover:font-bold"
            >
              {item.name}
            </Link>
          </div>
        ))}
      </div>
      <div className="flex flex-row gap-2 justify-center pb-4">
        {alphabet.map((letter) => {
          return (
            <button
              className={classNames(
                letter === selectedLetter?.toUpperCase()
                  ? 'underline font-bold text-lg'
                  : '',
                `cursor-pointer hover:font-bold`
              )}
              key={`letter-button-${letter}`}
              onClick={() => handleClick(letter)}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
