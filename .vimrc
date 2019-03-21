let g:ctrlp_custom_ignore = '\v[\/](node_modules)|(\.(swp|ico|git|svn|lock))$'
let g:indexSuffix = ""

function! QTBOpenIndex()
	let folder = expand('%:p:h')
	call QTBOpen(folder . "/index".g:indexSuffix.".html")
endfunction

function! QTBOSetSuffix(str)
	let g:indexSuffix = a:str
endfunction

command! -nargs=0 QTBOpenIndex call QTBOpenIndex()
command! -nargs=1 QTBOSetSuffix call QTBOSetSuffix(<f-args>) 

nnoremap <leader><leader>i :QTBOpenIndex<cr>
