export default function frenchFixer(original){
  return original
    .replace(/ de (h?[aâàeêéèiîoôuûy])/g, ' d’$1')
    .replace(/( l|L)(e|a) (h?[aâàeêéèiîoôuûy])/g, '$1’$3')
    .replace(/( t|T)a ([aâàeêéèiîoôuûy])/g, '$1on $2')
}