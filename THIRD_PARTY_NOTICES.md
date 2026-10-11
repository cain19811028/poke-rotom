# Third-Party Notices

voltdex bundles one piece of third-party material and downloads another at runtime.

## PokéAPI — `data/pokedex.json` (bundled)

`data/pokedex.json` is derived from data published by the
[PokéAPI](https://github.com/PokeAPI/pokeapi) project, which is distributed under the
BSD 3-Clause License reproduced below.

```text
Copyright (c) © 2013–2023 Paul Hallett and PokéAPI contributors (https://github.com/PokeAPI/pokeapi#contributing). Pokémon and Pokémon character names are trademarks of Nintendo.

All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

* Neither the name of PokéAPI nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## PokeAPI/sprites — images downloaded at runtime (not bundled)

No images are included in this repository. When asked to, voltdex downloads sprites
from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). According to that project:

- Pokémon artwork and in-game sprites are the property of Nintendo, Creatures Inc.,
  GAME FREAK Inc., and The Pokémon Company.
- The shiny versions of the official artwork (`--sprite official --shiny`) are custom
  sprites created by [@DevMike123](https://github.com/DevMike123),
  [@JoseBaGra](https://github.com/JoseBaGra), and Pokétwo.
- The animated `showdown` sprites (`--sprite showdown`) were designed by the
  [Smogon community](https://www.smogon.com/).
- Generation 9 `default` front sprites were provided by
  [KingOfThe-X-Roads](https://www.deviantart.com/kingofthe-x-roads).

See the [PokeAPI/sprites README](https://github.com/PokeAPI/sprites#readme) for the full
list of credits. These images are not licensed to you by voltdex.
