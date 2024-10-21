import File from '../library/file.mjs';

File.cacheHome = `${import.meta.dirname}/cache`;
File.cacheHome = `${import.meta.dirname}/data`;
export default File;

// import * as zwim from '../configuration/zwim.mjs';
// import { File } from '../library/file.mjs';
//
// export default new File({
//     ...zwim,
//     cacheHome: `${import.meta.dirname}/cache`,
//     dataHome: `${import.meta.dirname}/data`
// });
